"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { AlertCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "html-to-markdown")!;

const SAMPLE = `<h1>Hello, World!</h1>
<p>This is an <strong>HTML to Markdown</strong> converter.</p>
<ul>
  <li>Supports <em>italic</em> and <strong>bold</strong></li>
  <li><a href="https://tinkrkit.dev">Links</a></li>
  <li><code>inline code</code></li>
</ul>
<blockquote>
  <p>Blockquotes are supported too.</p>
</blockquote>
<pre><code class="language-js">const greet = (name) =&gt; \`Hello, \${name}!\`;
</code></pre>`;

export default function HtmlToMarkdownPage() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = useCallback(async () => {
    if (!input.trim()) return;
    try {
      const TurndownService = (await import("turndown")).default;
      const td = new TurndownService({
        headingStyle: "atx",       // # Heading
        codeBlockStyle: "fenced",  // ``` code ```
        bulletListMarker: "-",
        hr: "---",
      });
      // Preserve code blocks
      td.addRule("fencedCodeBlock", {
        filter: ["pre"],
        replacement: (content, node) => {
          const codeEl = (node as HTMLElement).querySelector("code");
          const lang = codeEl?.className?.replace("language-", "") || "";
          const code = codeEl?.textContent || content;
          return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
        },
      });
      setOutput(td.turndown(input));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  function handleClear() {
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button onClick={handleConvert} disabled={!input.trim()}>
            Convert to Markdown
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* HTML input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">HTML Input</label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(""); }}
              placeholder="Paste HTML here…"
              className="h-[480px] resize-none rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Markdown output */}
          <HighlightedOutput
            value={output}
            language="text"
            label="Markdown Output"
            filename="output.md"
            mimeType="text/markdown"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Info callout */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Common use cases</p>
          <p>Copy-pasting content from a website or CMS into a markdown-based blog · Converting HTML emails to readable markdown · Migrating documentation from HTML to a markdown static site generator (Docusaurus, MkDocs, Hugo).</p>
        </div>
      </div>
    </ToolLayout>
  );
}
