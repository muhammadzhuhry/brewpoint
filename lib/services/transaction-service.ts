import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, transactions, transactionItems } from "@/lib/db/schema";
import { AppError } from "@/lib/app-error";

export async function checkout(
  cashierId: string,
  items: { productId: string; quantity: number }[],
  amountReceived: string,
) {
  return db.transaction(async (tx) => {
    let total = 0;
    const lineItems: Omit<
      typeof transactionItems.$inferInsert,
      "transactionId"
    >[] = [];

    for (const item of items) {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .for("update");

      if (!product || !product.isActive) {
        throw new AppError(
          "NOT_FOUND",
          `Product ${item.productId} not found.`,
          404,
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          "INSUFFICIENT_STOCK",
          `Not enough stock for ${product.name}.`,
          409,
        );
      }

      await tx
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));

      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;

      lineItems.push({
        productId: product.id,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.price,
        quantity: item.quantity,
        subtotal: subtotal.toFixed(2),
      });
    }

    if (Number(amountReceived) < total) {
      throw new AppError(
        "BAD_REQUEST",
        "Amount received is less than the total.",
        400,
      );
    }

    const change = Number(amountReceived) - total;

    const [transaction] = await tx
      .insert(transactions)
      .values({
        cashierId,
        totalAmount: total.toFixed(2),
        amountReceived,
        changeAmount: change.toFixed(2),
        status: "completed",
      })
      .returning();

    await tx
      .insert(transactionItems)
      .values(
        lineItems.map((item) => ({ ...item, transactionId: transaction.id })),
      );

    return transaction;
  });
}

export async function listTransactions(params: {
  cashierId?: string;
  status?: "completed" | "voided";
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const conditions = [];
  if (params.cashierId) {
    conditions.push(eq(transactions.cashierId, params.cashierId));
  }
  if (params.status) {
    conditions.push(eq(transactions.status, params.status));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(transactions).where(where),
  ]);

  return { items, total: Number(total), page, pageSize };
}

export async function getTransactionById(id: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id));
  if (!transaction) {
    throw new AppError("NOT_FOUND", "Transaction not found.", 404);
  }

  const items = await db
    .select()
    .from(transactionItems)
    .where(eq(transactionItems.transactionId, id));

  return { ...transaction, items };
}

export async function voidTransaction(
  id: string,
  voidedBy: string,
  reason: string,
) {
  return db.transaction(async (tx) => {
    const [transaction] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!transaction) {
      throw new AppError("NOT_FOUND", "Transaction not found.", 404);
    }
    if (transaction.status === "voided") {
      throw new AppError("CONFLICT", "Transaction is already voided.", 409);
    }

    const items = await tx
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, id));

    for (const item of items) {
      await tx
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    const [voided] = await tx
      .update(transactions)
      .set({
        status: "voided",
        voidedBy,
        voidedReason: reason,
        voidedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    return voided;
  });
}
