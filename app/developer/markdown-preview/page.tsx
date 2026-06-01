"use client";

import { useState, useMemo } from "react";
import { getUrlInput } from "@/lib/url-input";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { marked } from "marked";
import { Copy, Check, Download, AlertCircle } from "lucide-react";

const MD_MAX = 2 * 1024 * 1024; // 2 MB

const tool = TOOLS.find((t) => t.slug === "markdown-preview")!;

const SAMPLE = `# Hello, tinkrkit.dev!

## Features

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://tinkrkit.dev)

## Code Block

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));
\`\`\`

> Blockquote example

| Name  | Age |
|-------|-----|
| Alice | 30  |
| Bob   | 25  |
`;

export default function MarkdownPreviewPage() {
  // If extension passed ?input=, use that; otherwise show sample
  const [input, setInput] = useState<string>(() => getUrlInput() || SAMPLE);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "preview" | "source">("split");
  const [sizeError, setSizeError] = useState<string | null>(null);

  function handleInputChange(val: string) {
    if (val.length > MD_MAX) {
      setSizeError("File too large. Maximum size is 2MB.");
      return; // reject
    }
    setSizeError(null);
    setInput(val);
  }

  const html = useMemo(() => {
    if (!input) return "";
    return marked.parse(input) as string;
  }, [input]);

  async function handleCopy() {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {(["split", "source", "preview"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 capitalize transition-colors ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
              {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy MD</>}
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-3 w-3" />Download
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setInput("")}>Clear</Button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className={`grid gap-4 ${view === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {(view === "split" || view === "source") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Markdown</label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type or paste Markdown here…"
                className={`h-[480px] resize-none rounded-lg border bg-card px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${sizeError ? "border-destructive/60" : "border-border"}`}
                spellCheck={false}
              />
              {sizeError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />{sizeError}
                </div>
              )}
            </div>
          )}
          {(view === "split" || view === "preview") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Preview</label>
              <div
                className="prose prose-sm dark:prose-invert max-w-none h-[480px] overflow-auto rounded-lg border border-border bg-card px-5 py-4"
                dangerouslySetInnerHTML={{ __html: html || "<p class='text-muted-foreground text-sm'>Nothing to preview yet…</p>" }}
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
