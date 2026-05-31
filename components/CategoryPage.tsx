import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TOOLS, CATEGORY_LABELS, type ToolCategory } from "@/lib/tools-config";

interface CategoryPageProps {
  category: ToolCategory;
  description: string;
}

export function CategoryPage({ category, description }: CategoryPageProps) {
  const tools = TOOLS.filter((t) => t.category === category);
  const label = CATEGORY_LABELS[category];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{label} Tools</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link key={tool.slug} href={tool.url}
                className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{tool.name}</p>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Tools coming soon.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
