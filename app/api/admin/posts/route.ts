// GET /api/admin/posts?status=pending|approved|rejected|all
// Server-side only — uses service role key to bypass RLS.
// Validates the caller is the admin via next-auth JWT.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { createAdminSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Auth check
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "all";
  const db     = createAdminSupabase();

  let query = db
    .from("blog_posts")
    .select("id, title, slug, description, tags, author_name, author_email, related_tool, status, rejection_reason, created_at, published_at")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin/posts GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
