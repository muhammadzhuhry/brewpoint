import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { createAdjustmentBodySchema } from "@/lib/validators/stock-adjustment";
import {
  createStockAdjustment,
  listStockAdjustments,
} from "@/lib/services/stock-adjustment-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const adjustments = await listStockAdjustments(id);
    return ok(adjustments);
  },
);

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    const claims = await requireAuth("admin");
    const { id } = await params;
    const body = createAdjustmentBodySchema.parse(await req.json());
    const adjustment = await createStockAdjustment(id, claims.userId, body);
    return ok(adjustment, 201);
  },
);
