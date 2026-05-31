import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllPosts } from "@/lib/blog";
import { supabase } from "@/lib/supabase";
import type { UnifiedPost } from "@/lib/supabase";
import { BlogListing } from "@/components/BlogListing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — tinkrkit.dev",
  description:
    "Guides, tutorials, and tips for developers and everyday users. Learn JSON, YAML, SQL, image optimization, and more.",
};

// Re-fetch on every request so approved posts appear immediately.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // ── MDX posts (from /content/blog/*.mdx) ────────────────────────────────
  const mdxPosts: UnifiedPost[] = getAllPosts().map((p) => ({
    slug:        p.slug,
    title:       p.title,
    description: p.description,
    tags:        p.tags,
    author:      "TinkrKit Team",
    date:        p.date,
    source:      "mdx",
  }));

  // ── Supabase approved posts ──────────────────────────────────────────────
  const { data: dbRows } = await supabase
    .from("blog_posts")
    .select("slug, title, description, tags, author_name, published_at, created_at")
    .eq("status", "approved")
    .order("published_at", { ascending: false });

  const dbPosts: UnifiedPost[] = (dbRows ?? []).map((p) => ({
    slug:        p.slug,
    title:       p.title,
    description: p.description ?? "",
    tags:        p.tags ?? [],
    author:      p.author_name,
    date:        p.published_at ?? p.created_at,
    source:      "db",
  }));

  // ── Merge + sort newest first, dedup by slug ──────────────────────────
  const seenSlugs = new Set<string>();
  const allPosts: UnifiedPost[] = [...dbPosts, ...mdxPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((p) => {
      if (seenSlugs.has(p.slug)) return false;
      seenSlugs.add(p.slug);
      return true;
    });

  // All unique tags (for filter pills)
  const allTags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags))
  ).sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <BlogListing posts={allPosts} allTags={allTags} />
      <Footer />
    </div>
  );
}
