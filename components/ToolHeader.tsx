import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORY_LABELS, type ToolCategory } from "@/lib/tools-config";

interface ToolHeaderProps {
  title: string;
  description: string;
  category: ToolCategory;
}

export function ToolHeader({ title, description, category }: ToolHeaderProps) {
  return (
    <div className="mb-6">
      <nav className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/${category}`}
          className="hover:text-foreground transition-colors capitalize"
        >
          {CATEGORY_LABELS[category]}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
