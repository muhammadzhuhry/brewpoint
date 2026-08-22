import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { updateCategoryBodySchema } from "@/lib/validators/category";
import {
  deleteCategory,
  updateCategory,
} from "@/lib/services/category-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const body = updateCategoryBodySchema.parse(await req.json());
    const category = await updateCategory(id, body);
    return ok(category);
  },
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const category = await deleteCategory(id);
    return ok(category);
  },
);
