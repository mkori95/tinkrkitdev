"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "remove-duplicates")!;

function removeDuplicates(
  text: string,
  caseSensitive: boolean,
  trimLines: boolean,
  keepLast: boolean
): string {
  const lines = text.split("\n");
  const seen = new Set<string>();
  const result: string[] = [];

  const getKey = (line: string) => {
    const key = trimLines ? line.trim() : line;
    return caseSensitive ? key : key.toLowerCase();
  };

  if (keepLast) {
    const reversed = [...lines].reverse();
    for (const line of reversed) {
      const key = getKey(line);
      if (!seen.has(key)) {
        seen.add(key);
        result.unshift(line);
      }
    }
  } else {
    for (const line of lines) {
      const key = getKey(line);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }
  }
  return result.join("\n");
}

export default function RemoveDuplicatesPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [keepLast, setKeepLast] = useState(false);
  const [stats, setStats] = useState<{ original: number; unique: number } | null>(null);

  function handleRemove() {
    if (!input.trim()) return;
    const result = removeDuplicates(input, caseSensitive, trimLines, keepLast);
    setOutput(result);
    const originalLines = input.split("\n").length;
    const uniqueLines = result.split("\n").length;
    setStats({ original: originalLines, unique: uniqueLines });
  }

  function clear() {
    setInput("");
    setOutput("");
    setStats(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Input Text"
          placeholder="Paste text with duplicate lines here…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={10}
        />

        {/* Options */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Options</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              Case-sensitive
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              Trim whitespace before comparing
            </label>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Keep:</span>
            {[
              { label: "First occurrence", value: false },
              { label: "Last occurrence", value: true },
            ].map(({ label, value }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="radio"
                  checked={keepLast === value}
                  onChange={() => setKeepLast(value)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleRemove} disabled={!input.trim()}>
            Remove Duplicates
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !output}>
            Clear
          </Button>
          {stats && (
            <span className="ml-auto text-sm text-muted-foreground">
              {stats.original} lines → {stats.unique} unique &mdash;{" "}
              <span className="text-primary font-medium">{stats.original - stats.unique} removed</span>
            </span>
          )}
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Result"
          filename="deduplicated.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
