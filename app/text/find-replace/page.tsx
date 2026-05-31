"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "find-replace")!;

interface ReplaceOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  replaceAll: boolean;
}

function findAndReplace(
  text: string,
  find: string,
  replace: string,
  options: ReplaceOptions
): { result: string; count: number } {
  if (!find) return { result: text, count: 0 };

  let count = 0;

  const flags = options.replaceAll
    ? options.caseSensitive
      ? "g"
      : "gi"
    : options.caseSensitive
    ? ""
    : "i";

  const pattern = options.useRegex
    ? new RegExp(find, flags)
    : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);

  const result = text.replace(pattern, () => {
    count++;
    return replace;
  });

  return { result, count };
}

function countMatches(text: string, find: string, options: ReplaceOptions): number {
  if (!find) return 0;
  const flags = options.caseSensitive ? "g" : "gi";
  const pattern = options.useRegex
    ? new RegExp(find, flags)
    : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
  return (text.match(pattern) || []).length;
}

export default function FindReplacePage() {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    caseSensitive: false,
    useRegex: false,
    replaceAll: true,
  });
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  function handleReplace() {
    if (!input || !find) return;
    try {
      const { result, count: c } = findAndReplace(input, find, replace, options);
      setOutput(result);
      setCount(c);
      setError("");
    } catch {
      setError("Invalid regex pattern. Check your Find expression.");
      setOutput("");
      setCount(null);
    }
  }

  // live match count (no replacement)
  let matchCount = 0;
  if (input && find && !error) {
    try {
      matchCount = countMatches(input, find, options);
    } catch {
      // ignore invalid regex while typing
    }
  }

  function clear() {
    setInput("");
    setFind("");
    setReplace("");
    setOutput("");
    setCount(null);
    setError("");
  }

  function toggleOption<K extends keyof ReplaceOptions>(key: K) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Text"
          placeholder="Paste your text here…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={8}
        />

        {/* Find/Replace fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Find</label>
              {input && find && matchCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {matchCount} match{matchCount !== 1 ? "es" : ""}
                </span>
              )}
            </div>
            <input
              type="text"
              value={find}
              onChange={(e) => { setFind(e.target.value); setError(""); }}
              placeholder={options.useRegex ? "Regex pattern, e.g. \\bword\\b" : "Text to find…"}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Replace with</label>
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replacement text (leave empty to delete)…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Options */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Options</p>
          <div className="flex flex-wrap gap-4">
            {[
              { key: "caseSensitive" as const, label: "Case-sensitive" },
              { key: "useRegex" as const, label: "Use regex" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="h-4 w-4 rounded accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Replace:</span>
            {[
              { label: "All occurrences", value: true },
              { label: "First only", value: false },
            ].map(({ label, value }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="radio"
                  checked={options.replaceAll === value}
                  onChange={() => setOptions((prev) => ({ ...prev, replaceAll: value }))}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={handleReplace} disabled={!input.trim() || !find}>
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !find && !output}>
            Clear
          </Button>
          {count !== null && (
            <span className="ml-auto text-sm text-muted-foreground">
              Replaced{" "}
              <span className="text-primary font-medium">{count}</span>{" "}
              occurrence{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Result"
          filename="replaced.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
