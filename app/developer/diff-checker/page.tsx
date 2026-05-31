"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import * as Diff from "diff";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "diff-checker")!;

export default function DiffCheckerPage() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffs, setDiffs] = useState<Diff.Change[] | null>(null);
  const [stats, setStats] = useState({ added: 0, removed: 0 });

  function compare() {
    if (!original && !modified) return;
    const result = Diff.diffLines(original, modified);
    setDiffs(result);

    let added = 0, removed = 0;
    for (const part of result) {
      const lines = part.value.split("\n").filter(Boolean).length;
      if (part.added) added += lines;
      if (part.removed) removed += lines;
    }
    setStats({ added, removed });
  }

  function clear() {
    setOriginal("");
    setModified("");
    setDiffs(null);
    setStats({ added: 0, removed: 0 });
  }

  function loadExample() {
    setOriginal(`function greet(name) {
  console.log("Hello, " + name);
  return name;
}

const user = "Alice";
greet(user);`);
    setModified(`function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
  console.log("Welcome!");
  return name;
}

const user = "Bob";
greet(user, "Hi");`);
    setDiffs(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Side-by-side textareas */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InputArea
            value={original}
            onChange={setOriginal}
            label="Original"
            placeholder="Paste original text here..."
            accept=".txt"
            maxSizeBytes={5242880}
            rows={12}
          />
          <InputArea
            value={modified}
            onChange={setModified}
            label="Modified"
            placeholder="Paste modified text here..."
            accept=".txt"
            maxSizeBytes={5242880}
            rows={12}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={compare} disabled={!original && !modified}>
            Compare
          </Button>
          <Button variant="outline" size="sm" onClick={loadExample}>
            Load example
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">
            Clear
          </Button>
        </div>

        {/* Stats */}
        {diffs && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              {stats.added} line{stats.added !== 1 ? "s" : ""} added
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              {stats.removed} line{stats.removed !== 1 ? "s" : ""} removed
            </span>
            {stats.added === 0 && stats.removed === 0 && (
              <span className="text-muted-foreground">No differences found — texts are identical</span>
            )}
          </div>
        )}

        {/* Diff output */}
        {diffs && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/60 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diff Output</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="text-green-500">+</span> added</span>
                <span className="flex items-center gap-1"><span className="text-red-500">-</span> removed</span>
              </div>
            </div>
            <div className="overflow-auto max-h-[500px] bg-[#1e1e2e]">
              {diffs.map((part, i) => {
                const lines = part.value.split("\n");
                // remove trailing empty string from split
                if (lines[lines.length - 1] === "") lines.pop();
                return lines.map((line, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={cn(
                      "flex items-start px-4 py-0.5 font-mono text-sm",
                      part.added && "bg-green-500/15 text-green-300",
                      part.removed && "bg-red-500/15 text-red-300",
                      !part.added && !part.removed && "text-[#cdd6f4]/60"
                    )}
                  >
                    <span className="mr-3 w-4 shrink-0 select-none text-xs opacity-60">
                      {part.added ? "+" : part.removed ? "-" : " "}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line}</span>
                  </div>
                ));
              })}
            </div>
          </div>
        )}

        {!diffs && !original && !modified && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Paste your texts above and click Compare to see the differences highlighted.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
