import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { updateProductBodySchema } from "@/lib/validators/product";
import { deleteProduct, updateProduct } from "@/lib/services/product-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const body = updateProductBodySchema.parse(await req.json());
    const product = await updateProduct(id, body);
    return ok(product);
  },
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const product = await deleteProduct(id);
    return ok(product);
  },
);
