// middleware.ts — runs in Edge Runtime
// Protects all /admin/* routes. Uses next-auth JWT to verify identity.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin/* paths
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.email === process.env.ADMIN_EMAIL;

  // /admin/login is publicly accessible (but redirect away if already logged in)
  if (pathname === "/admin/login") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/blog", req.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes require the admin session
  if (!isAdmin) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
