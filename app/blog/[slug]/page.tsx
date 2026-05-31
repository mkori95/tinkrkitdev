import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { supabase } from "@/lib/supabase";
import type { DBPost } from "@/lib/supabase";
import { TOOLS } from "@/lib/tools-config";
import Link from "next/link";
import { ArrowLeft, Tag, Wrench, Clock, User } from "lucide-react";
import type { Metadata } from "next";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

const MDX_OPTIONS = {
  mdxOptions: { remarkPlugins: [remarkGfm] },
};

// ── Static params (MDX only — DB posts are dynamic) ──────────────────────────

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const mdx = getPostBySlug(params.slug);
  if (mdx) return { title: `${mdx.title} — tinkrkit.dev`, description: mdx.description };

  const { data: db } = await supabase
    .from("blog_posts")
    .select("title, description")
    .eq("slug", params.slug)
    .eq("status", "approved")
    .single();

  if (!db) return {};
  return { title: `${db.title} — tinkrkit.dev`, description: db.description ?? undefined };
}

// ── Related posts section ─────────────────────────────────────────────────────

async function RelatedPosts({ tags, currentSlug }: { tags: string[]; currentSlug: string }) {
  const mdxPosts = getAllPosts()
    .filter((p) => p.slug !== currentSlug && p.tags.some((t) => tags.includes(t)))
    .slice(0, 3);

  const { data: dbRows } = await supabase
    .from("blog_posts")
    .select("slug, title, description, tags, author_name, published_at")
    .eq("status", "approved")
    .neq("slug", currentSlug)
    .limit(6);

  const dbRelated = (dbRows ?? [])
    .filter((p) => (p.tags ?? []).some((t: string) => tags.includes(t)))
    .slice(0, 3 - mdxPosts.length);

  const related = [
    ...mdxPosts.map((p) => ({
      slug:   p.slug,
      title:  p.title,
      date:   p.date,
      author: "TinkrKit Team",
    })),
    ...dbRelated.map((p) => ({
      slug:   p.slug,
      title:  p.title,
      date:   p.published_at ?? "",
      author: p.author_name,
    })),
  ].slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-base font-semibold text-foreground">Related Posts</h2>
      <div className="space-y-3">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground mb-0.5">
              {p.date ? fmtDate(p.date) : ""} · {p.author}
            </p>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {p.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Social share ──────────────────────────────────────────────────────────────

function SocialShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = encodeURIComponent(`https://tinkrkit.dev/blog/${slug}`);
  const text = encodeURIComponent(title);
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      <p className="w-full text-xs font-medium text-muted-foreground mb-1">Share this post</p>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        𝕏 Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        Facebook
      </a>
    </div>
  );
}

// ── Tool CTA card ─────────────────────────────────────────────────────────────

function ToolCta({
  toolPath,
  toolName,
}: {
  toolPath: string;
  toolName: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Try the free tool</p>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Use our free browser-based {toolName} — no login, nothing sent to servers.
      </p>
      <Link
        href={toolPath}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Open {toolName}
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  // ── 1. Supabase is the primary source ─────────────────────────────────────
  // Check DB first so migrated and user-submitted posts are always served
  // from the canonical DB record. MDX files stay as a fallback for local dev
  // or if Supabase is unavailable.
  const { data: dbPost, error: dbError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "approved")
    .maybeSingle<DBPost>(); // maybeSingle doesn't throw when 0 rows; single() does

  if (dbError) {
    console.error(`[blog/${params.slug}] Supabase error:`, dbError.message, dbError.code);
  }

  if (dbPost) {
    const toolObj = TOOLS.find(
      (t) => `/${t.category}/${t.slug}` === dbPost.related_tool
    );
    const toolName    = toolObj?.name ?? "TinkrKit Tool";
    const displayDate = dbPost.published_at ?? dbPost.created_at;

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All posts
          </Link>

          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{fmtDate(displayDate)}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{dbPost.author_name}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(dbPost.content)}</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {dbPost.title}
            </h1>
            {dbPost.description && (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {dbPost.description}
              </p>
            )}
            {dbPost.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3 w-3 text-muted-foreground/60" />
                {dbPost.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr className="mb-8 border-border" />
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MDXRemote source={dbPost.content} options={MDX_OPTIONS} />
          </div>

          {dbPost.related_tool && (
            <ToolCta toolPath={dbPost.related_tool} toolName={toolName} />
          )}
          <SocialShareButtons title={dbPost.title} slug={dbPost.slug} />
          <RelatedPosts tags={dbPost.tags} currentSlug={dbPost.slug} />

          <div className="mt-10 rounded-xl border border-border bg-muted/20 p-5 text-center">
            <p className="mb-2 text-sm font-medium text-foreground">Have something to share?</p>
            <p className="mb-3 text-xs text-muted-foreground">Submit your own post and reach TinkrKit&apos;s community.</p>
            <Link
              href="/blog/submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Submit a post →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── 2. MDX fallback (local dev / Supabase unavailable) ────────────────────
  const mdxPost = getPostBySlug(params.slug);

  if (mdxPost) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All posts
          </Link>

          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{fmtDate(mdxPost.date)}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />TinkrKit Team</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(mdxPost.content)}</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {mdxPost.title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {mdxPost.description}
            </p>
            {mdxPost.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3 w-3 text-muted-foreground/60" />
                {mdxPost.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr className="mb-8 border-border" />
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MDXRemote source={mdxPost.content} options={MDX_OPTIONS} />
          </div>

          <ToolCta toolPath={mdxPost.relatedTool} toolName={mdxPost.relatedToolName} />
          <SocialShareButtons title={mdxPost.title} slug={mdxPost.slug} />
          <RelatedPosts tags={mdxPost.tags} currentSlug={mdxPost.slug} />

          <div className="mt-10 rounded-xl border border-border bg-muted/20 p-5 text-center">
            <p className="mb-2 text-sm font-medium text-foreground">Have something to share?</p>
            <p className="mb-3 text-xs text-muted-foreground">Submit your own post and reach TinkrKit&apos;s community.</p>
            <Link
              href="/blog/submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Submit a post →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── 3. Nothing found anywhere → 404 ──────────────────────────────────────
  notFound();
}
