import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import { createUserBodySchema } from "@/lib/validators/user";
import { createUser, listUsers } from "@/lib/services/user-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async () => {
  await requireAuth("admin");
  const users = await listUsers();
  return ok(users);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAuth("admin");
  const body = createUserBodySchema.parse(await req.json());
  const user = await createUser(body);
  return ok(user, 201);
});
