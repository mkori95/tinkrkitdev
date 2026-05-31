"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import { Logo } from "./Logo";
import { useLayout } from "@/contexts/LayoutContext";

// Update this URL once the extension is published to the Chrome Web Store.
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/search/TinkrKit";

// ── Add to Chrome button ──────────────────────────────────────────────────────
function AddToChrome() {
  return (
    <a
      href={CHROME_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden sm:flex items-center gap-1.5 rounded-full border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-500 transition-colors hover:bg-indigo-500 hover:text-white"
      aria-label="Add TinkrKit to Chrome"
    >
      <span>🧩</span>
      <span>Add to Chrome</span>
    </a>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const { mode, toggle } = useLayout();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Logo size="md" />
        </Link>

        {/* Layout toggle — homepage only */}
        {isHome && (
          <button
            onClick={toggle}
            title={mode === "grid" ? "Switch to Side Layout" : "Switch to Grid View"}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {mode === "grid" ? (
              <><LayoutDashboard className="h-3.5 w-3.5" /><span className="hidden sm:inline">Side Layout</span></>
            ) : (
              <><LayoutGrid className="h-3.5 w-3.5" /><span className="hidden sm:inline">Grid View</span></>
            )}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav links */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <Link
            href="/blog"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Add to Chrome */}
        <AddToChrome />

        {/* Dark mode toggle */}
        <DarkModeToggle />
      </div>
    </header>
  );
}
