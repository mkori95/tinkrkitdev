"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "whitespace-remover")!;

interface CleanOptions {
  trimLines: boolean;
  removeBlankLines: boolean;
  collapseSpaces: boolean;
  removeAllSpaces: boolean;
  removeTabs: boolean;
  removeLineBreaks: boolean;
}

function cleanWhitespace(text: string, options: CleanOptions): string {
  let out = text;
  if (options.removeTabs) out = out.replace(/\t/g, "    ");
  if (options.trimLines) out = out.split("\n").map((l) => l.trim()).join("\n");
  if (options.collapseSpaces) out = out.replace(/ {2,}/g, " ");
  if (options.removeBlankLines) out = out.split("\n").filter((l) => l.trim()).join("\n");
  if (options.removeAllSpaces) out = out.replace(/ /g, "");
  if (options.removeLineBreaks) out = out.replace(/\n/g, " ");
  return out;
}

const OPTION_LABELS: Array<{ key: keyof CleanOptions; label: string; description: string }> = [
  { key: "trimLines", label: "Trim lines", description: "Remove leading/trailing whitespace from each line" },
  { key: "removeBlankLines", label: "Remove blank lines", description: "Delete empty and whitespace-only lines" },
  { key: "collapseSpaces", label: "Collapse spaces", description: "Replace multiple spaces with a single space" },
  { key: "removeTabs", label: "Convert tabs to spaces", description: "Replace tab characters with 4 spaces" },
  { key: "removeAllSpaces", label: "Remove all spaces", description: "Delete every space character" },
  { key: "removeLineBreaks", label: "Remove line breaks", description: "Join all lines into a single line" },
];

export default function WhitespaceRemoverPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<CleanOptions>({
    trimLines: true,
    removeBlankLines: false,
    collapseSpaces: false,
    removeAllSpaces: false,
    removeTabs: false,
    removeLineBreaks: false,
  });
  const [stats, setStats] = useState<{ charsRemoved: number; linesRemoved: number } | null>(null);

  function handleClean() {
    if (!input) return;
    const result = cleanWhitespace(input, options);
    setOutput(result);
    setStats({
      charsRemoved: input.length - result.length,
      linesRemoved: input.split("\n").length - result.split("\n").length,
    });
  }

  function clear() {
    setInput("");
    setOutput("");
    setStats(null);
  }

  function toggleOption(key: keyof CleanOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Input Text"
          placeholder="Paste your text here…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={10}
        />

        {/* Options */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Cleaning Options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTION_LABELS.map(({ key, label, description }) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="mt-0.5 h-4 w-4 rounded accent-primary"
                />
                <div>
                  <div className="text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleClean} disabled={!input.trim()}>
            Clean Text
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !output}>
            Clear
          </Button>
          {stats && (
            <div className="ml-auto text-sm text-muted-foreground">
              <span className="text-primary font-medium">{stats.charsRemoved}</span> chars removed
              {stats.linesRemoved > 0 && (
                <>
                  {" · "}
                  <span className="text-primary font-medium">{stats.linesRemoved}</span> lines removed
                </>
              )}
            </div>
          )}
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Cleaned Text"
          filename="cleaned.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
