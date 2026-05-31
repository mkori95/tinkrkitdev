import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TOOLS } from "@/lib/tools-config";

const devTools = TOOLS.filter((t) => t.category === "developer");

export const metadata = {
  title: "Developer Tools Online — Free & Instant | tinkrkit.dev",
  description: "Free online developer tools: JSON formatter, XML formatter, YAML validator, SQL formatter, CSV viewer, Markdown preview and more.",
};

export default function DeveloperPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="mt-2 text-muted-foreground">Free browser-based tools for JSON, XML, YAML, SQL, CSV, Markdown and more.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {devTools.map((tool) => (
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
      </main>
      <Footer />
    </div>
  );
}
