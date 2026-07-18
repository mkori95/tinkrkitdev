"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { marked } from "marked";
import { HighlightedOutput } from "@/components/HighlightedOutput";

const tool = TOOLS.find((t) => t.slug === "markdown-to-html")!;

const SAMPLE = `# Hello, World!

## Introduction

This is a **Markdown to HTML** converter. It turns markdown into clean, copyable HTML.

- Supports *italic* and **bold**
- [Links](https://tinkrkit.dev)
- \`inline code\`

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

> Blockquotes are supported too.
`;

export default function MarkdownToHtmlPage() {
  const [input, setInput] = useState(SAMPLE);

  const html = useMemo(() => {
    if (!input.trim()) return "";
    return marked.parse(input) as string;
  }, [input]);

  function handleClear() {
    setInput("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Markdown input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Markdown</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste Markdown here…"
              className="h-[480px] resize-none rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* HTML source output */}
          <HighlightedOutput
            value={html}
            language="xml"
            label="HTML Output"
            filename="output.html"
            mimeType="text/html"
          />
        </div>

        {/* Info callout */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Markdown Preview vs Markdown to HTML</p>
          <p>
            <a href="/developer/markdown-preview" className="text-primary underline underline-offset-2">Markdown Preview</a>
            {" "}renders markdown visually. This tool gives you the raw HTML source — useful for pasting into a CMS, email template, or static site.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
