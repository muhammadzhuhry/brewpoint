import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stockAdjustments } from "@/lib/db/schema";
import { AppError } from "@/lib/app-error";

export async function createStockAdjustment(
  productId: string,
  adminId: string,
  input: {
    adjustmentType: "increase" | "decrease";
    quantity: number;
    reason: string;
  },
) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .for("update");

    if (!product) {
      throw new AppError("NOT_FOUND", "Product not found.", 404);
    }

    const newStock =
      input.adjustmentType === "increase"
        ? product.stockQuantity + input.quantity
        : product.stockQuantity - input.quantity;

    if (newStock < 0) {
      throw new AppError(
        "BAD_REQUEST",
        "Adjustment would take stock below zero.",
        400,
      );
    }

    await tx
      .update(products)
      .set({ stockQuantity: newStock })
      .where(eq(products.id, productId));

    const [adjustment] = await tx
      .insert(stockAdjustments)
      .values({
        productId,
        adminId,
        adjustmentType: input.adjustmentType,
        quantity: input.quantity,
        reason: input.reason,
      })
      .returning();

    return adjustment;
  });
}

export async function listStockAdjustments(productId: string) {
  return db
    .select()
    .from(stockAdjustments)
    .where(eq(stockAdjustments.productId, productId))
    .orderBy(desc(stockAdjustments.createdAt));
}
