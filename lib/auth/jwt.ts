import { SignJWT, jwtVerify } from "jose";

import { AppError } from "@/lib/app-error";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const expiryHours = Number(process.env.JWT_EXPIRY_HOURS ?? 8);

export type SessionClaims = {
  userId: string;
  username: string;
  role: "admin" | "cashier";
};

export async function signJwt(claims: SessionClaims) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryHours}h`)
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<SessionClaims> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionClaims;
  } catch {
    throw new AppError("UNAUTHORIZED", "Invalid or expired session");
  }
}
