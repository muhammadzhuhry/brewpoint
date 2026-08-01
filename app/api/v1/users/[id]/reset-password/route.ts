import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { resetPasswordBodySchema } from "@/lib/validators/user";
import { resetPassword } from "@/lib/services/user-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const { password } = resetPasswordBodySchema.parse(await req.json());
    const user = await resetPassword(id, password);
    return ok(user);
  },
);
