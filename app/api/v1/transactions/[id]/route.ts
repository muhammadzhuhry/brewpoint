import { requireAuth } from "@/lib/auth/session";
import { getTransactionById } from "@/lib/services/transaction-service";
import { AppError } from "@/lib/app-error";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req, { params }: Params) => {
  const claims = await requireAuth();
  const { id } = await params;
  const transaction = await getTransactionById(id);

  if (claims.role !== "admin" && transaction.cashierId !== claims.userId) {
    throw new AppError(
      "FORBIDDEN",
      "You can't view another cashier's transaction.",
      403,
    );
  }

  return ok(transaction);
});
