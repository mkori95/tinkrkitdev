import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog-data";

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Related Posts
      </h2>
      <div className="space-y-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-start justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                {post.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {post.description}
              </p>
            </div>
            <ArrowRight className="ml-3 mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
