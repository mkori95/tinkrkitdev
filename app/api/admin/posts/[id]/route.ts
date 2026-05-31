// PATCH /api/admin/posts/[id]  — approve | reject | unpublish | reconsider
// GET   /api/admin/posts/[id]  — fetch single post with full content (for preview)
// Auth: getServerSession (correct for App Router route handlers).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createAdminSupabase } from "@/lib/supabase";
import { Resend } from "resend";

// ── Shared auth helper ────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return session;
}

// ── Shared Supabase helper ────────────────────────────────────────────────────

function getDb() {
  try {
    return { db: createAdminSupabase(), err: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Supabase admin client failed";
    console.error("[admin/posts/[id]]", msg);
    return { db: null, err: msg };
  }
}

// ── PATCH — perform an action on a post ──────────────────────────────────────

type Action = "approve" | "reject" | "unpublish" | "reconsider";
interface Body { action: Action; reason?: string; }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db, err } = getDb();
  if (!db) return NextResponse.json({ error: err }, { status: 500 });

  const { id } = params;
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, reason } = body;

  if (!["approve", "reject", "unpublish", "reconsider"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (action === "reject" && !reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
  }

  // Fetch current post (needed for email)
  const { data: post, error: fetchErr } = await db
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Build update payload
  const update: Record<string, unknown> = {};
  switch (action) {
    case "approve":
      update.status           = "approved";
      update.rejection_reason = null;
      update.published_at     = new Date().toISOString();
      break;
    case "reject":
      update.status           = "rejected";
      update.rejection_reason = reason;
      update.published_at     = null;
      break;
    case "unpublish":
      update.status       = "pending";
      update.published_at = null;
      break;
    case "reconsider":
      update.status           = "pending";
      update.rejection_reason = null;
      break;
  }

  const { error: updateErr } = await db
    .from("blog_posts")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    console.error("[admin/posts PATCH]", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Send rejection email via Resend (non-blocking)
  if (action === "reject" && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        // Requires tinkrkit.dev to be verified in Resend dashboard
        from:    "TinkrKit Blog <blog@tinkrkit.dev>",
        to:      post.author_email,
        subject: `Your TinkrKit blog post — "${post.title}"`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 4px">Hi ${post.author_name},</h2>
            <p style="color:#666;margin-top:0">Thanks for submitting to the TinkrKit blog.</p>
            <p>After review, we weren't able to publish your post <strong>"${post.title}"</strong> at this time.</p>
            <div style="background:#f5f5f5;border-left:3px solid #6366F1;padding:12px 16px;margin:16px 0;border-radius:4px">
              <p style="margin:0;font-size:14px;color:#333"><strong>Feedback from our editor:</strong></p>
              <p style="margin:8px 0 0;color:#444;font-size:14px">${reason}</p>
            </div>
            <p>You're welcome to revise and resubmit at
               <a href="https://tinkrkit.dev/blog/submit">tinkrkit.dev/blog/submit</a>.</p>
            <p style="color:#888;font-size:13px">— The TinkrKit Team</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[admin/posts reject email]", emailErr);
    }
  }

  return NextResponse.json({ ok: true, action });
}

// ── GET — fetch single post with full content (for preview modal) ─────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db, err } = getDb();
  if (!db) return NextResponse.json({ error: err }, { status: 500 });

  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}
