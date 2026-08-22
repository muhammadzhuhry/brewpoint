import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { createProductBodySchema } from "@/lib/validators/product";
import { createProduct, searchProducts } from "@/lib/services/product-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth();

  const { searchParams } = new URL(req.url);
  const result = await searchProducts({
    search: searchParams.get("search") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    page: searchParams.get("page")
      ? Number(searchParams.get("page"))
      : undefined,
  });
  return ok(result);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAuth("admin");
  const body = createProductBodySchema.parse(await req.json());
  const product = await createProduct(body);
  return ok(product, 201);
});
