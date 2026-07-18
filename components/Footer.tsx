import Link from "next/link";
import { TOOLS, CATEGORIES, type Tool } from "@/lib/tools-config";
import { SocialShare } from "./SocialShare";
import { BuyMeCoffee } from "./BuyMeCoffee";
import { Logo } from "./Logo";

const toolsBySlug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

const FOOTER_GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: "JSON Tools",
    tools: ["json-formatter", "json-validator", "json-minifier", "json-to-yaml", "json-to-xml", "json-to-csv", "json-schema"]
      .map((s) => toolsBySlug[s]).filter(Boolean),
  },
  {
    label: "XML & Markup",
    tools: ["xml-formatter", "xml-to-json", "yaml-formatter", "markdown-preview", "html-preview"]
      .map((s) => toolsBySlug[s]).filter(Boolean),
  },
  {
    label: "Data & SQL",
    tools: ["csv-viewer", "sql-formatter", "diff-checker"]
      .map((s) => toolsBySlug[s]).filter(Boolean),
  },
  {
    label: "Encoding & Hashing",
    tools: ["base64", "url-encoder", "html-encoder", "hash-generator", "jwt-decoder"]
      .map((s) => toolsBySlug[s]).filter(Boolean),
  },
  {
    label: "Dev Utilities",
    tools: ["regex-tester", "uuid-generator", "cron-builder", "timestamp-converter", "color-converter", "base-converter"]
      .map((s) => toolsBySlug[s]).filter(Boolean),
  },
  ...CATEGORIES.filter((c) => c.id !== "developer").map((cat) => ({
    label: cat.label,
    tools: TOOLS.filter((t) => t.category === cat.id),
  })),
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">

      {/* ── Support strip ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm sm:flex-row sm:px-6">
          <p className="text-center text-muted-foreground sm:text-left">
            <span className="font-semibold text-foreground">Support TinkrKit</span>
            {" "}— free forever, share it or tip us on PayPal 💙
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

        {/* footer-tools-grid / footer-category defined in globals.css — plain CSS
            columns shorthand is more reliable than Tailwind arbitrary values    */}
        <div className="footer-tools-grid">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.label} className="footer-category">
              <p className="footer-category-title">{group.label}</p>
              <ul>
                {group.tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link href={tool.url} className="footer-category-link">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
