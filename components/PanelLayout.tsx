"use client";

/**
 * PanelLayout — wraps any tool's input + output panels with a
 * Stacked ↔ Side-by-Side layout toggle.
 *
 * Usage:
 *   <PanelLayout toolSlug="json-formatter" controls={<Buttons />}
 *     input={<InputArea />} output={<><Error /><Output /></>} />
 *
 * The layout preference is persisted per-tool in localStorage.
 * On mobile (< md breakpoint) the layout is always stacked.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlignVerticalJustifyStart, Columns2 } from "lucide-react";

type Layout = "stacked" | "side";

function readLayout(key: string): Layout {
  if (typeof window === "undefined") return "stacked";
  return (localStorage.getItem(`tinkrkit:layout:${key}`) as Layout) ?? "stacked";
}

export function PanelLayout({
  toolSlug,
  controls,
  input,
  output,
}: {
  toolSlug: string;
  controls: React.ReactNode;
  input:    React.ReactNode;
  output:   React.ReactNode;
}) {
  const [layout, setLayout] = useState<Layout>(() => readLayout(toolSlug));

  function toggle(v: Layout) {
    setLayout(v);
    localStorage.setItem(`tinkrkit:layout:${toolSlug}`, v);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row — tool buttons on the left, layout toggle on the right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">{controls}</div>

        {/* Layout toggle pill */}
        <div
          className="hidden sm:flex items-center rounded-full border border-border bg-muted/40 p-0.5 gap-0.5"
          title="Toggle panel layout"
        >
          <button
            onClick={() => toggle("stacked")}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              layout === "stacked"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlignVerticalJustifyStart className="h-3 w-3" />
            Stacked
          </button>
          <button
            onClick={() => toggle("side")}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              layout === "side"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns2 className="h-3 w-3" />
            Side by side
          </button>
        </div>
      </div>

      {/* Panels — stacked on mobile always; side-by-side on sm+ when preferred */}
      <div
        className={cn(
          "flex gap-4",
          layout === "side" ? "flex-col sm:flex-row sm:items-stretch" : "flex-col"
        )}
      >
        <div className={cn(layout === "side" ? "sm:w-1/2 flex flex-col" : "w-full")}>{input}</div>
        <div className={cn(layout === "side" ? "sm:w-1/2 flex flex-col" : "w-full")}>{output}</div>
      </div>
    </div>
  );
}
