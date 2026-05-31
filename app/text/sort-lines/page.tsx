"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "sort-lines")!;

type SortMode = "asc" | "desc" | "shortest" | "longest" | "random";

const SORT_OPTIONS: Array<{ mode: SortMode; label: string }> = [
  { mode: "asc", label: "A → Z" },
  { mode: "desc", label: "Z → A" },
  { mode: "shortest", label: "Shortest first" },
  { mode: "longest", label: "Longest first" },
  { mode: "random", label: "Random shuffle" },
];

function sortLines(
  text: string,
  mode: SortMode,
  caseSensitive: boolean,
  removeBlanks: boolean,
  trimLines: boolean
): string {
  let lines = text.split("\n");
  if (trimLines) lines = lines.map((l) => l.trim());
  if (removeBlanks) lines = lines.filter((l) => l.trim());

  const compare = (a: string, b: string) => {
    const ka = caseSensitive ? a : a.toLowerCase();
    const kb = caseSensitive ? b : b.toLowerCase();
    return ka.localeCompare(kb);
  };

  switch (mode) {
    case "asc":
      lines.sort(compare);
      break;
    case "desc":
      lines.sort((a, b) => compare(b, a));
      break;
    case "shortest":
      lines.sort((a, b) => a.length - b.length);
      break;
    case "longest":
      lines.sort((a, b) => b.length - a.length);
      break;
    case "random":
      lines.sort(() => Math.random() - 0.5);
      break;
  }
  return lines.join("\n");
}

export default function SortLinesPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<SortMode>("asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeBlanks, setRemoveBlanks] = useState(false);
  const [trimLines, setTrimLines] = useState(false);

  function handleSort() {
    if (!input.trim()) return;
    setOutput(sortLines(input, mode, caseSensitive, removeBlanks, trimLines));
  }

  function clear() {
    setInput("");
    setOutput("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Input Text"
          placeholder="Paste text with lines to sort…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={10}
        />

        {/* Sort mode */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Sort Order</p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(({ mode: m, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm font-medium pt-1">Options</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Case-sensitive", value: caseSensitive, set: setCaseSensitive },
              { label: "Remove blank lines", value: removeBlanks, set: setRemoveBlanks },
              { label: "Trim lines", value: trimLines, set: setTrimLines },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSort} disabled={!input.trim()}>
            Sort Lines
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !output}>
            Clear
          </Button>
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Sorted Lines"
          filename="sorted.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
