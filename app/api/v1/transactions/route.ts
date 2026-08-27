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
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const result = await listTransactions({
    cashierId: isAdmin
      ? (searchParams.get("cashierId") ?? undefined)
      : claims.userId,
    status:
      (searchParams.get("status") as "completed" | "voided" | null) ??
      undefined,
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
    page: searchParams.has("page")
      ? Number(searchParams.get("page"))
      : undefined,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
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
