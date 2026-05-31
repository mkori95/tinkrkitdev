// app/sitemap.ts — generates /sitemap.xml via Next.js Metadata API
// Re-validates every hour so newly approved blog posts appear promptly.

import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/tools-config";
import { getAllPosts } from "@/lib/blog";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600; // regenerate at most once per hour

const BASE = "https://tinkrkit.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             `${BASE}/`,
      lastModified:    now,
      changeFrequency: "daily",
      priority:        1.0,
    },
    {
      url:             `${BASE}/blog`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.7,
    },
    {
      url:             `${BASE}/blog/submit`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${BASE}/about`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${BASE}/contact`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${BASE}/privacy`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${BASE}/terms`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.5,
    },
  ];

  // ── Tool pages (64 tools across 6 categories) ────────────────────────────────
  const toolPages: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url:             `${BASE}/${tool.category}/${tool.slug}`,
    lastModified:    now,
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  // ── MDX blog posts (from /content/blog/*.mdx) ────────────────────────────────
  const mdxPosts = getAllPosts();
  const mdxPostPages: MetadataRoute.Sitemap = mdxPosts.map((post) => ({
    url:             `${BASE}/blog/${post.slug}`,
    lastModified:    new Date(post.date),
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  // ── Supabase approved blog posts ─────────────────────────────────────────────
  const { data: dbPosts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, created_at")
    .eq("status", "approved");

  // Filter out slugs already covered by MDX to avoid duplicates
  const mdxSlugs = new Set(mdxPosts.map((p) => p.slug));

  const dbPostPages: MetadataRoute.Sitemap = (dbPosts ?? [])
    .filter((p) => !mdxSlugs.has(p.slug))
    .map((post) => ({
      url:             `${BASE}/blog/${post.slug}`,
      lastModified:    new Date(post.published_at ?? post.created_at),
      changeFrequency: "weekly" as const,
      priority:        0.7,
    }));

  return [
    ...staticPages,
    ...toolPages,
    ...mdxPostPages,
    ...dbPostPages,
  ];
}
