"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Image,
  FileText,
  FolderOpen,
  Type,
  Calculator,
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SocialShare } from "@/components/SocialShare";
import { CATEGORIES, TOOLS, getPopularTools, searchTools } from "@/lib/tools-config";
import { useLayout } from "@/contexts/LayoutContext";

const CATEGORY_ICONS = {
  "code-2": Code2,
  image: Image,
  "file-text": FileText,
  "folder-open": FolderOpen,
  type: Type,
  calculator: Calculator,
};

type SideCategory = "popular" | "favorites" | "developer" | "image" | "pdf" | "file" | "text" | "math";

const SIDE_CATEGORIES: { id: SideCategory; label: string }[] = [
  { id: "popular",   label: "Popular" },
  { id: "favorites", label: "Favorites" },
  { id: "developer", label: "Developer" },
  { id: "image",     label: "Image" },
  { id: "pdf",       label: "PDF" },
  { id: "file",      label: "File" },
  { id: "text",      label: "Text" },
  { id: "math",      label: "Math" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sideQuery, setSideQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SideCategory>("popular");
  const { mode, favorites, toggleFavorite } = useLayout();

  const popular = getPopularTools(12);
  const results = query.trim() ? searchTools(query) : [];

  // Compute tools for side panel
  function getSideTools() {
    const pool =
      activeCategory === "popular"
        ? getPopularTools(50)
        : activeCategory === "favorites"
        ? TOOLS.filter((t) => favorites.has(t.slug))
        : TOOLS.filter((t) => t.category === activeCategory);

    if (!sideQuery.trim()) return pool;
    const q = sideQuery.toLowerCase();
    return pool.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  const sideTools = getSideTools();

  // Tool card used in side layout
  function SideToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
    const cat = CATEGORIES.find((c) => c.id === tool.category);
    const Icon = cat ? CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] : null;
    const isFav = favorites.has(tool.slug);

    return (
      <div className="group relative flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
        <Link href={tool.url} className="absolute inset-0 z-0 rounded-xl" aria-label={tool.name} />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && cat && (
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cat.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{tool.name}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.slug); }}
            className={`relative z-10 ml-1 shrink-0 rounded p-0.5 transition-colors hover:bg-accent ${isFav ? "text-amber-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-400" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
      </div>
    );
  }

  /* ─── SIDE LAYOUT ─── */
  if (mode === "side") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Mobile: horizontal scrollable tabs */}
          <div className="block border-b border-border bg-background sm:hidden">
            <div className="flex overflow-x-auto px-4 py-2 gap-2 scrollbar-none">
              {SIDE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: two-panel */}
          <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:gap-6 sm:px-6 sm:py-6">
            {/* Sidebar — hidden on mobile */}
            <aside className="hidden sm:flex sm:w-44 shrink-0 flex-col gap-1 pt-1">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              {SIDE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                    activeCategory === cat.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.id === "favorites" && favorites.size > 0 && (
                    <span className="ml-auto rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      {favorites.size}
                    </span>
                  )}
                </button>
              ))}
            </aside>

            {/* Right panel */}
            <div className="flex-1 min-w-0 px-4 py-4 sm:px-0 sm:py-0">
              {/* Panel header */}
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold capitalize">
                  {SIDE_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h2>
                <div className="relative flex-1 max-w-xs ml-auto">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={sideQuery}
                    onChange={(e) => setSideQuery(e.target.value)}
                    placeholder="Filter tools…"
                    className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Tools grid */}
              {sideTools.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sideTools.map((tool) => (
                    <SideToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              ) : activeCategory === "favorites" ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                  <Star className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No favorites yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Click ★ on any tool card to save it here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                  <p className="text-sm text-muted-foreground">No tools match &ldquo;{sideQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ─── GRID LAYOUT (default) ─── */
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-transparent py-12 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Free · Browser-based · No login required
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Every tool you need,{" "}
              <span className="text-primary">right here</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground">
              Free online tools for developers, designers, and everyday users.
              No login. No uploads to servers. 100% browser-based.
            </p>

            {/* Search */}
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools — JSON formatter, image compressor..."
                className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />

              {query.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  {results.length > 0 ? (
                    <ul>
                      {results.slice(0, 8).map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            href={tool.url}
                            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors"
                            onClick={() => setQuery("")}
                          >
                            <div>
                              <span className="font-medium">{tool.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground capitalize">
                                {tool.category}
                              </span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      No tools found for &ldquo;{query}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-8 pb-12 sm:px-6">
          <h2 className="mb-6 text-xl font-semibold">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS];
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.id}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}>
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cat.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular Tools */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Popular Tools</h2>
              <Link
                href="/developer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popular.map((tool) => {
                const cat = CATEGORIES.find((c) => c.id === tool.category);
                const Icon = cat ? CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] : null;
                return (
                  <Link
                    key={tool.slug}
                    href={tool.url}
                    className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {Icon && cat && (
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cat.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {tool.name}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Ad blocker banner */}
        <section className="border-y border-border bg-muted/20">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm sm:flex-row sm:px-6">
            <p className="text-center text-muted-foreground sm:text-left">
              <span className="font-medium text-foreground">Ad blocker on? No worries.</span>
              {" "}Share TinkrKit instead — it keeps everything free. 🙌
            </p>
            <SocialShare variant="homepage" />
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: "100% Browser-Based",
                body: "Everything runs in your browser. Your files and data never leave your device.",
              },
              {
                title: "No Login, Ever",
                body: "No account needed. No sign-up. Just open a tool and start using it immediately.",
              },
              {
                title: "Always Free",
                body: "Every tool is free to use. Funded by unobtrusive ads. No paywalls, ever.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
