import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";

import { db } from "@/lib/db";
import { transactionItems, transactions } from "@/lib/db/schema";

export async function getSalesSummary(params: { from?: Date; to?: Date }) {
  const from = params.from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const to = params.to ?? new Date();

  const [result] = await db
    .select({
      totalSales: sum(transactions.totalAmount),
      transactionCount: count(),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.createdAt, from),
        lte(transactions.createdAt, to),
      ),
    );

  return {
    totalSales: result.totalSales ?? "0.00",
    transactionCount: Number(result.transactionCount),
  };
}

export async function getBestSellers(params: {
  from?: Date;
  to?: Date;
  limit?: number;
}) {
  const from = params.from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const to = params.to ?? new Date();
  const limit = params.limit ?? 5;

  const totalQuantity = sum(transactionItems.quantity);

  const rows = await db
    .select({
      productId: transactionItems.productId,
      productName: transactionItems.productNameSnapshot,
      totalQuantity,
    })
    .from(transactionItems)
    .innerJoin(
      transactions,
      eq(transactionItems.transactionId, transactions.id),
    )
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.createdAt, from),
        lte(transactions.createdAt, to),
      ),
    )
    .groupBy(transactionItems.productId, transactionItems.productNameSnapshot)
    .orderBy(desc(totalQuantity))
    .limit(limit);

  return rows.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    totalQuantity: Number(row.totalQuantity),
  }));
}
