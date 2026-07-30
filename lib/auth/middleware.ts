import { NextRequest, NextResponse } from "next/server";

import { fail } from "@/lib/api-response";

const PUBLIC_PATHS = ["/login", "/api/v1/auth/login"];

export function middleware(req: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
