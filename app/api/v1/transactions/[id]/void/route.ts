import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { voidBodySchema } from "@/lib/validators/transaction";
import { voidTransaction } from "@/lib/services/transaction-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    const claims = await requireAuth("admin");
    const { id } = await params;
    const { reason } = voidBodySchema.parse(await req.json());
    const transaction = await voidTransaction(id, claims.userId, reason);
    return ok(transaction);
  },
);
