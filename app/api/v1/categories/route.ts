import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { createCategoryBodySchema } from "@/lib/validators/category";
import {
  createCategory,
  listCategories,
} from "@/lib/services/category-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async () => {
  await requireAuth();
  const categories = await listCategories();
  return ok(categories);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAuth("admin");
  const body = createCategoryBodySchema.parse(await req.json());
  const category = await createCategory(body);
  return ok(category, 201);
});
