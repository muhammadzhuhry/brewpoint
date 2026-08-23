import { NextRequest, NextResponse } from "next/server";

import { fail } from "@/lib/api-response";
import { verifyJwt } from "@/lib/auth/jwt";
import { ROUTE_ROLES } from "@/lib/route-roles";

const PUBLIC_PATHS = ["/login", "/api/v1/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session");
  if (!session) {
    return pathname.startsWith("/api")
      ? fail("UNAUTHORIZED", "Not authenticated", 401)
      : NextResponse.redirect(new URL("/login", req.url));
  }

  const allowedRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];

  if (allowedRoles && !pathname.startsWith("/api")) {
    try {
      const claims = await verifyJwt(session.value);
      if (!allowedRoles.includes(claims.role)) {
        return NextResponse.redirect(new URL("/checkout", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
