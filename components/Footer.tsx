import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/lib/tools-config";
import { SocialShare } from "./SocialShare";
import { BuyMeCoffee } from "./BuyMeCoffee";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">

      {/* ── Support strip ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm sm:flex-row sm:px-6">
          <p className="text-center text-muted-foreground sm:text-left">
            <span className="font-semibold text-foreground">Support TinkrKit</span>
            {" "}— free forever, share it or buy us a coffee ☕
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SocialShare variant="footer" />
            <BuyMeCoffee variant="footer" />
          </div>
        </div>
      </div>

      {/* ── Tools directory ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          All Tools
        </p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const catTools = TOOLS.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id}>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                  {cat.label}
                </p>
                <ul className="space-y-1.5">
                  {catTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={tool.url}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors leading-snug"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Chrome Extension teaser */}
        <div className="mt-8 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">
            🧩 TinkrKit Chrome Extension
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use TinkrKit tools directly from your browser. Right-click any text → Open in TinkrKit.
          </p>
          <a
            href="https://chromewebstore.google.com/search/TinkrKit"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
          >
            Add to Chrome →
          </a>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/content-policy" className="hover:text-foreground transition-colors">Content Policy</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {year} tinkrkit.dev
          </p>
        </div>
      </div>

    </footer>
  );
}
