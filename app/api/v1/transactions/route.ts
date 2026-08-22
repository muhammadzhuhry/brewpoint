import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { checkoutBodySchema } from "@/lib/validators/transaction";
import { checkout, listTransactions } from "@/lib/services/transaction-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const claims = await requireAuth();
  const isAdmin = claims.role === "admin";

  const { searchParams } = new URL(req.url);
  const result = await listTransactions({
    cashierId: isAdmin
      ? (searchParams.get("cashierId") ?? undefined)
      : claims.userId,
    status:
      (searchParams.get("status") as "completed" | "voided" | null) ??
      undefined,
    page: searchParams.has("page")
      ? Number(searchParams.get("page"))
      : undefined,
  });
  return ok(result);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const claims = await requireAuth();
  const body = checkoutBodySchema.parse(await req.json());
  const transaction = await checkout(
    claims.userId,
    body.items,
    body.amountReceived,
  );
  return ok(transaction, 201);
});
