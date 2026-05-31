// Server-only — uses Node.js fs. Only import in Server Components.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPostMeta } from "./blog-data";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function readAllFiles(): { data: BlogPostMeta; content: string }[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      const { data, content } = matter(raw);
      return { data: data as BlogPostMeta, content };
    });
}

export function getAllPosts(): BlogPostMeta[] {
  return readAllFiles()
    .map(({ data }) => data)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const match = readAllFiles().find(({ data }) => data.slug === slug);
  if (!match) return null;
  return { ...match.data, content: match.content };
}
