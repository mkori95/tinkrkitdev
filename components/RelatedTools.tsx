import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools-config";

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Related Tools
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.url}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
          >
            {tool.name}
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
