import { and, count, eq, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, transactionItems } from "@/lib/db/schema";
import { AppError } from "@/lib/app-error";
import { getCategoryById } from "@/lib/services/category-service";

export async function searchProducts(params: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const conditions = [eq(products.isActive, true)];

  if (params.search) {
    conditions.push(
      sql`(to_tsvector('simple', ${products.name}) @@ plainto_tsquery('simple', ${params.search}) OR ${products.barcode} = ${params.search})`,
    );
  }

  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId));
  }

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return { items, total: Number(total), page, pageSize };
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) throw new AppError("NOT_FOUND", "Product not found.", 404);
  return product;
}

export async function createProduct(input: {
  name: string;
  categoryId: string;
  price: string;
  stockQuantity: number;
  barcode?: string;
  imageUrl?: string;
}) {
  await getCategoryById(input.categoryId);

  if (input.barcode) {
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.barcode, input.barcode));
    if (existing) {
      throw new AppError("CONFLICT", "Barcode is already in use.", 409);
    }
  }

  const [product] = await db.insert(products).values(input).returning();
  return product;
}

export async function updateProduct(
  id: string,
  input: {
    name: string;
    categoryId: string;
    price: string;
    stockQuantity: number;
    barcode?: string;
    imageUrl?: string;
  },
) {
  await getCategoryById(input.categoryId);

  if (input.barcode) {
    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.barcode, input.barcode), ne(products.id, id)));
    if (existing) {
      throw new AppError("CONFLICT", "Barcode is already in use.", 409);
    }
  }

  const [product] = await db
    .update(products)
    .set(input)
    .where(eq(products.id, id))
    .returning();
  if (!product) throw new AppError("NOT_FOUND", "Product not found.", 404);
  return product;
}

export async function deleteProduct(id: string) {
  const [soldItem] = await db
    .select({ id: transactionItems.id })
    .from(transactionItems)
    .where(eq(transactionItems.productId, id))
    .limit(1);

  if (soldItem) {
    const [product] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning();
    if (!product) throw new AppError("NOT_FOUND", "Product not found.", 404);
    return product;
  }

  const [product] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  if (!product) throw new AppError("NOT_FOUND", "Product not found.", 404);
  return product;
}
