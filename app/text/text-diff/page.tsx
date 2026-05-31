"use client";

import { useState } from "react";
import * as Diff from "diff";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "text-diff")!;

export default function TextDiffPage() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [diffs, setDiffs] = useState<Diff.Change[] | null>(null);
  const [stats, setStats] = useState<{ added: number; removed: number } | null>(null);

  function handleCompare() {
    const result = Diff.diffLines(original, changed);
    setDiffs(result);
    let added = 0;
    let removed = 0;
    for (const part of result) {
      const lines = (part.value.match(/\n/g) || []).length;
      if (part.added) added += lines || 1;
      else if (part.removed) removed += lines || 1;
    }
    setStats({ added, removed });
  }

  function clear() {
    setOriginal("");
    setChanged("");
    setDiffs(null);
    setStats(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Two text areas */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Original Text</label>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original text here…"
              rows={12}
              className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Changed Text</label>
            <textarea
              value={changed}
              onChange={(e) => setChanged(e.target.value)}
              placeholder="Paste changed text here…"
              rows={12}
              className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCompare} disabled={!original && !changed}>
            Compare
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!original && !changed}>
            Clear
          </Button>
          {stats && (
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+{stats.added} added</span>
              <span className="text-red-600 dark:text-red-400 font-medium">-{stats.removed} removed</span>
            </div>
          )}
        </div>

        {/* Diff output */}
        {diffs !== null && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Diff</label>
            {diffs.length === 0 || diffs.every((d) => !d.added && !d.removed) ? (
              <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                No differences found — the texts are identical.
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden font-mono text-sm">
                {diffs.map((part, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-3 py-0.5 whitespace-pre-wrap",
                      part.added && "bg-green-500/15 text-green-700 dark:text-green-400",
                      part.removed && "bg-red-500/15 text-red-600 dark:text-red-400",
                      !part.added && !part.removed && "text-muted-foreground"
                    )}
                  >
                    {(part.added ? "+ " : part.removed ? "- " : "  ") + part.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
