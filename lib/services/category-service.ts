import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { AppError } from "@/lib/app-error";

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));
  if (!category) throw new AppError("NOT_FOUND", "Category not found.", 404);
  return category;
}

export async function createCategory(input: { name: string }) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, input.name));
  if (existing) {
    throw new AppError("CONFLICT", "Category name is already taken.", 409);
  }

  const [category] = await db
    .insert(categories)
    .values({ name: input.name })
    .returning();
  return category;
}

export async function updateCategory(id: string, input: { name: string }) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.name, input.name), ne(categories.id, id)));
  if (existing) {
    throw new AppError("CONFLICT", "Category name is already taken.", 409);
  }

  const [category] = await db
    .update(categories)
    .set({ name: input.name })
    .where(eq(categories.id, id))
    .returning();
  if (!category) throw new AppError("NOT_FOUND", "Category not found.", 404);
  return category;
}

export async function deleteCategory(id: string) {
  const [productInCategory] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.categoryId, id))
    .limit(1);

  if (productInCategory) {
    throw new AppError(
      "CONFLICT",
      "This category still has products assigned to it.",
      409,
    );
  }

  const [category] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();
  if (!category) throw new AppError("NOT_FOUND", "Category not found.", 404);
  return category;
}
