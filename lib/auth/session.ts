import { cookies } from "next/headers";

import { AppError } from "@/lib/app-error";
import { verifyJwt } from "@/lib/auth/jwt";

export async function requireAuth(role?: "admin" | "cashier") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) throw new AppError("UNAUTHORIZED", "Not authenticated");

  const claims = await verifyJwt(token);
  if (role && claims.role !== role) {
    throw new AppError("FORBIDDEN", "Insufficient permissions");
  }
  return claims;
}
