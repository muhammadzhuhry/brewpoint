import { requireAuth } from "@/lib/auth/session";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async () => {
  const claims = await requireAuth();
  return ok(claims);
});
