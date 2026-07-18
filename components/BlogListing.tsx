"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { UnifiedPost } from "@/lib/supabase";
import {
  BookOpen, ArrowRight, Tag, Search, X, ChevronLeft, ChevronRight, PenLine,
} from "lucide-react";

const PAGE_SIZE = 5;

type SortMode = "latest" | "oldest" | "relevant";

export function BlogListing({
  posts,
  allTags,
}: {
  posts:   UnifiedPost[];
  allTags: string[];
}) {
  const [query,      setQuery]      = useState("");
  const [activeTag,  setActiveTag]  = useState<string | null>(null);
  const [sortMode,   setSortMode]   = useState<SortMode>("latest");
  const [page,       setPage]       = useState(1);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = posts.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });

    if (sortMode === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortMode === "relevant" && q) {
      result = [...result].sort((a, b) => {
        const score = (p: UnifiedPost) =>
          (p.title.toLowerCase().includes(q) ? 3 : 0) +
          (p.description.toLowerCase().includes(q) ? 2 : 0) +
          p.tags.filter((t) => t.toLowerCase().includes(q)).length;
        return score(b) - score(a);
      });
    }
    // "latest" is already the default order from the server

    return result;
  }, [posts, query, activeTag, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pagePosts  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setActiveTag(null);
    setSortMode("latest");
    setPage(1);
  }

  const hasFilters = query || activeTag;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} — guides, tutorials, and tips.
            </p>
          </div>
        </div>
        <Link
          href="/blog/submit"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <PenLine className="h-3.5 w-3.5" />
          Submit a post
        </Link>
      </div>

      {/* ── Search + sort ───────────────────────────────────────────────── */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search posts…"
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={sortMode}
          onChange={(e) => { setSortMode(e.target.value as SortMode); setPage(1); }}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-all"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="relevant">Most relevant</option>
        </select>
      </div>

      {/* ── Tag filter pills ────────────────────────────────────────────── */}
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActiveTag(null); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeTag
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setActiveTag(activeTag === tag ? null : tag); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Posts list ──────────────────────────────────────────────────── */}
      {pagePosts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-sm text-muted-foreground">No posts match your search.</p>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pagePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>{post.author}</span>
                  </div>
                  <h2 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Tag className="h-3 w-3 text-muted-foreground/60" />
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            // Always show first, last, current, and 1 neighbour each side
            const show =
              n === 1 ||
              n === totalPages ||
              Math.abs(n - safePage) <= 1;
            // Show ellipsis slot instead of hidden pages
            const showEllipsisBefore = n === safePage - 2 && safePage - 2 > 1;
            const showEllipsisAfter  = n === safePage + 2 && safePage + 2 < totalPages;

            if (!show && !showEllipsisBefore && !showEllipsisAfter) return null;
            if (showEllipsisBefore || showEllipsisAfter) {
              return (
                <span key={`ellipsis-${n}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
                  …
                </span>
              );
            }
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  safePage === n
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {n}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
