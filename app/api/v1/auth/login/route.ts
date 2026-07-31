import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";
import { AppError } from "@/lib/app-error";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { username, password } = await req.json();

  if (!username || !password) {
    throw new AppError("BAD_REQUEST", "Username and password are required.");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (!user || !user.isActive) {
    throw new AppError("UNAUTHORIZED", "Invalid username or password.", 401);
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError("UNAUTHORIZED", "Invalid username or password.", 401);
  }

  const token = await signJwt({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  const response = ok({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Number(process.env.JWT_EXPIRY_HOURS ?? 8) * 60 * 60,
  });

  return response;
});
