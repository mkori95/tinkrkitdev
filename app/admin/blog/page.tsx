"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";
import { marked } from "marked";
import {
  Check, X, RefreshCw, EyeOff, Eye, LogOut,
  Calendar, Tag, User, Mail, Loader2, FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id:               string;
  title:            string;
  slug:             string;
  description:      string | null;
  tags:             string[];
  author_name:      string;
  author_email:     string;
  related_tool:     string | null;
  status:           "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at:       string;
  published_at:     string | null;
}

type Tab = "pending" | "approved" | "rejected";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [post, setPost]   = useState<Post & { content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/posts/${postId}`)
      .then(r => r.json())
      .then(d => setPost(d.post))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">Post Preview</p>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : post ? (
            <div>
              <h2 className="mb-2 text-xl font-bold text-foreground">{post.title}</h2>
              {post.description && (
                <p className="mb-4 text-sm text-muted-foreground">{post.description}</p>
              )}
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author_name}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{post.author_email}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(post.created_at)}</span>
              </div>
              {post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.map(t => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
                  ))}
                </div>
              )}
              <hr className="mb-4 border-border" />
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Failed to load post.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({
  post,
  onConfirm,
  onClose,
}: {
  post: Post;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy]     = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) return;
    setBusy(true);
    await onConfirm(reason.trim());
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">Reject Post</p>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6">
          <p className="mb-1 text-sm text-foreground font-medium truncate">{post.title}</p>
          <p className="mb-4 text-xs text-muted-foreground">by {post.author_name} · {post.author_email}</p>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            Rejection reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Explain why this post isn't being published. This will be emailed to the author."
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            📧 An email will be sent to <strong>{post.author_email}</strong> with this reason.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || busy}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Reject & email author
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onPreview,
  onApprove,
  onReject,
  onUnpublish,
  onReconsider,
  busy,
}: {
  post:         Post;
  onPreview:    (id: string) => void;
  onApprove?:   (id: string) => void;
  onReject?:    (post: Post) => void;
  onUnpublish?: (id: string) => void;
  onReconsider?:(id: string) => void;
  busy:         boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Title + meta */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground leading-snug">{post.title}</h3>
        {post.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{post.description}</p>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><User className="h-3 w-3 shrink-0" />{post.author_name}</span>
        <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" />{post.author_email}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 shrink-0" />{fmtDate(post.created_at)}</span>
        {post.related_tool && (
          <span className="flex items-center gap-1"><FileText className="h-3 w-3 shrink-0" />{post.related_tool}</span>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Tag className="h-3 w-3 text-muted-foreground/60 mt-0.5 shrink-0" />
          {post.tags.map(t => (
            <span key={t} className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
          ))}
        </div>
      )}

      {/* Rejection reason (rejected tab) */}
      {post.rejection_reason && (
        <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          <strong>Rejection reason:</strong> {post.rejection_reason}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPreview(post.id)}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>

        {onApprove && (
          <button
            onClick={() => onApprove(post.id)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve
          </button>
        )}

        {onReject && (
          <button
            onClick={() => onReject(post)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        )}

        {onUnpublish && (
          <button
            onClick={() => onUnpublish(post.id)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
            Unpublish
          </button>
        )}

        {onReconsider && (
          <button
            onClick={() => onReconsider(post.id)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Reconsider
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [posts,      setPosts]      = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<Tab>("pending");
  const [busyId,     setBusyId]     = useState<string | null>(null);
  const [previewId,  setPreviewId]  = useState<string | null>(null);
  const [rejectPost, setRejectPost] = useState<Post | null>(null);

  // ── Fetch all posts ──────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/posts?status=all");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── Action handler ──────────────────────────────────────────────────────────
  async function doAction(
    id:     string,
    action: "approve" | "reject" | "unpublish" | "reconsider",
    reason?: string
  ) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        await fetchPosts();
        setRejectPost(null);
      }
    } finally {
      setBusyId(null);
    }
  }

  // ── Derived counts ──────────────────────────────────────────────────────────
  const counts = {
    pending:  posts.filter(p => p.status === "pending").length,
    approved: posts.filter(p => p.status === "approved").length,
    rejected: posts.filter(p => p.status === "rejected").length,
  };

  const visiblePosts = posts.filter(p => p.status === activeTab);

  const TABS: { id: Tab; label: string }[] = [
    { id: "pending",  label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">
              / Blog Admin
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, approve, and manage submitted blog posts.
          </p>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Post list ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 text-4xl opacity-30">
              {activeTab === "pending" ? "📬" : activeTab === "approved" ? "📗" : "📭"}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {activeTab === "pending"
                ? "No posts waiting for review."
                : activeTab === "approved"
                ? "No published posts yet."
                : "No rejected posts."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                busy={busyId === post.id}
                onPreview={setPreviewId}
                onApprove={activeTab === "pending" ? (id) => doAction(id, "approve") : undefined}
                onReject={activeTab === "pending" ? setRejectPost : undefined}
                onUnpublish={activeTab === "approved" ? (id) => doAction(id, "unpublish") : undefined}
                onReconsider={activeTab === "rejected" ? (id) => doAction(id, "reconsider") : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {previewId && (
        <PreviewModal postId={previewId} onClose={() => setPreviewId(null)} />
      )}

      {rejectPost && (
        <RejectModal
          post={rejectPost}
          onClose={() => setRejectPost(null)}
          onConfirm={(reason) => doAction(rejectPost.id, "reject", reason)}
        />
      )}
    </div>
  );
}
