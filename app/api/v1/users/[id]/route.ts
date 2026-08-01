import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import {
  setActiveBodySchema,
  updateUserBodySchema,
} from "@/lib/validators/user";
import { setUserActive, updateUser } from "@/lib/services/user-service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const body = updateUserBodySchema.parse(await req.json());
    const user = await updateUser(id, body);
    return ok(user);
  },
);

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: Params) => {
    await requireAuth("admin");
    const { id } = await params;
    const { isActive } = setActiveBodySchema.parse(await req.json());
    const user = await setUserActive(id, isActive);
    return ok(user);
  },
);
