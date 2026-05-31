// middleware.ts — Edge Runtime
// Double-layer protection for /admin routes:
//   1. Middleware (this file) — fast redirect at the edge, any domain
//   2. Server-side getServerSession in each page.tsx — fallback if edge cookie differs

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Explicit cookie names cover both HTTP (dev) and HTTPS (prod/custom domain)
    cookieName: req.headers.get("x-forwarded-proto") === "https"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  const isAdmin = token?.email === process.env.ADMIN_EMAIL;

  // /admin/login — public, but bounce already-authenticated admins away
  if (pathname === "/admin/login") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/blog", req.url));
    }
    return NextResponse.next();
  }

  // /admin (root) and all /admin/* routes — require admin session
  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matches /admin exactly AND /admin/anything — both were needed
  matcher: ["/admin", "/admin/:path*"],
};
