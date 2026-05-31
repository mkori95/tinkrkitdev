// Static blog post metadata — safe to import in client components.
// Mirrors the frontmatter in /content/blog/*.mdx
// When adding new posts, update this list.

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  relatedTool: string;
  relatedToolName: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "what-is-json-complete-guide",
    title: "What is JSON? Complete Guide + Free Online Formatter",
    date: "2026-05-28",
    description: "Learn what JSON is, why it matters, and how to format it instantly with our free online JSON formatter.",
    tags: ["json", "formatter", "developer tools", "beginner"],
    relatedTool: "/developer/json-formatter",
    relatedToolName: "JSON Formatter",
  },
  {
    slug: "json-vs-xml-comparison",
    title: "JSON vs XML — Which Format Should You Use in 2026?",
    date: "2026-05-28",
    description: "A practical comparison of JSON and XML — when to use each, key differences, and free online tools to work with both.",
    tags: ["json", "xml", "comparison", "developer tools", "data formats"],
    relatedTool: "/developer/xml-formatter",
    relatedToolName: "XML Formatter",
  },
  {
    slug: "yaml-tutorial-syntax-examples",
    title: "YAML Tutorial — Syntax, Examples, and Common Errors",
    date: "2026-05-28",
    description: "Learn YAML syntax with real examples, understand common errors, and validate your YAML files instantly for free.",
    tags: ["yaml", "tutorial", "developer tools", "config", "devops"],
    relatedTool: "/developer/yaml-formatter",
    relatedToolName: "YAML Formatter",
  },
  {
    slug: "sql-formatting-best-practices",
    title: "SQL Formatting Best Practices for Clean, Readable Queries",
    date: "2026-05-28",
    description: "Learn SQL formatting best practices with examples, and format your SQL queries instantly with our free online SQL formatter.",
    tags: ["sql", "formatting", "database", "developer tools", "best practices"],
    relatedTool: "/developer/sql-formatter",
    relatedToolName: "SQL Formatter",
  },
  {
    slug: "how-to-compress-images-without-losing-quality",
    title: "How to Compress Images Without Losing Quality (Free Online Tool)",
    date: "2026-05-28",
    description: "Learn how image compression works and compress your JPG, PNG, and WebP images for free — no upload to servers required.",
    tags: ["image compression", "optimize images", "webp", "png", "jpg", "free tool"],
    relatedTool: "/image/image-compressor",
    relatedToolName: "Image Compressor",
  },
];

export function getRelatedPostsForTool(toolUrl: string, limit = 3): BlogPostMeta[] {
  return BLOG_POSTS.filter((p) => p.relatedTool === toolUrl).slice(0, limit);
}
