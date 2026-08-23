import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { getBestSellers } from "@/lib/services/dashboard-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth("admin");

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const limitParam = searchParams.get("limit");

  const bestSellers = await getBestSellers({
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
    limit: limitParam ? Number(limitParam) : undefined,
  });

  return ok(bestSellers);
});
