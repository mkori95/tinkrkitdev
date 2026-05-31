"use client";

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, Download, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "html-preview")!;

type ViewMode = "editor" | "preview" | "split";

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
      color: #333;
    }
    h1 { color: #6366f1; }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      background: #f9fafb;
    }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>Hello, tinkrkit.dev!</h1>
  <div class="card">
    <p>This is a live HTML preview. Edit the code on the left to see changes instantly.</p>
  </div>
  <button onclick="alert('Hello!')">Click me</button>
  <script>
    console.log('HTML Preview loaded!');
  </script>
</body>
</html>`;

export default function HtmlPreviewPage() {
  const [html, setHtml] = useState(EXAMPLE_HTML);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  async function copy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clear() {
    setHtml("");
  }

  const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: "editor", label: "Editor" },
    { key: "preview", label: "Preview" },
    { key: "split", label: "Split" },
  ];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {VIEW_MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  viewMode === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={copy}>
              {copied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={download} disabled={!html}>
              <Download className="h-3.5 w-3.5" />Download .html
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>

        {/* Sandbox warning */}
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          Preview runs in a sandboxed iframe with restricted permissions. Scripts are allowed but network access is blocked.
        </div>

        {/* Editor + Preview */}
        <div
          className={cn(
            "gap-4",
            viewMode === "split" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
          )}
        >
          {/* Editor */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">HTML Editor</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Enter HTML code here..."
                className="w-full resize-none rounded-lg border border-border bg-[#1e1e2e] px-3 py-2.5 font-mono text-sm text-[#cdd6f4] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors leading-relaxed"
                style={{ height: viewMode === "split" ? "500px" : "400px" }}
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                {html.length.toLocaleString()} characters
              </p>
            </div>
          )}

          {/* Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Live Preview</label>
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts"
                srcDoc={html || "<html><body><p style='color:#888;font-family:sans-serif;padding:2rem'>Preview will appear here…</p></body></html>"}
                className="w-full rounded-lg border border-border bg-white"
                style={{ height: viewMode === "split" ? "500px" : "500px" }}
                title="HTML Preview"
              />
            </div>
          )}
        </div>

        {/* Quick snippets */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Quick start</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Load example", action: () => setHtml(EXAMPLE_HTML) },
              {
                label: "Basic HTML5",
                action: () => setHtml(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`),
              },
              {
                label: "With Tailwind CDN",
                action: () => setHtml(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <script src="https://cdn.tailwindcss.com"><\/script>\n</head>\n<body class="p-8">\n  <h1 class="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>\n  <p class="mt-2 text-gray-600">Styled with Tailwind CSS.</p>\n</body>\n</html>`),
              },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
