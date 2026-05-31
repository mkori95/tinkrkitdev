import Link from "next/link";
import { Tag } from "lucide-react";

interface KeywordTagsProps {
  keywords: string[];
}

export function KeywordTags({ keywords }: KeywordTagsProps) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Tag className="h-3.5 w-3.5" />
        Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <Link
            key={kw}
            href={`/?q=${encodeURIComponent(kw)}`}
            className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {kw}
          </Link>
        ))}
      </div>
    </div>
  );
}
