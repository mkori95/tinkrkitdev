// GET /api/admin/posts?status=pending|approved|rejected|all
// Server-side only — uses service role key to bypass RLS.
// Auth: getServerSession (correct for App Router route handlers).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createAdminSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  // getServerSession is the correct approach for App Router route handlers.
  // getToken (next-auth/jwt) is only reliable in Edge Runtime (middleware).
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Supabase ─────────────────────────────────────────────────────────────────
  let db;
  try {
    db = createAdminSupabase();
  } catch (e) {
    console.error("[admin/posts GET] createAdminSupabase failed:", e);
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const status = req.nextUrl.searchParams.get("status") ?? "all";

  let query = db
    .from("blog_posts")
    .select(
      "id, title, slug, description, tags, author_name, author_email, related_tool, status, rejection_reason, created_at, published_at"
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin/posts GET] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
