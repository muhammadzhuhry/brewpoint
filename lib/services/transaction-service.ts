import { eq, sql } from "drizzle-orm";

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
