"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TreeView } from "./TreeView";

// ── Syntax highlighters ───────────────────────────────────────────────────────

interface HighlightedOutputProps {
  value: string;
  language?: "json" | "xml" | "yaml" | "sql" | "csv" | "text";
  label?: string;
  filename?: string;
  mimeType?: string;
  className?: string;
  minHeight?: string;
  /**
   * When provided, a Raw ↔ Tree toggle appears on the output panel.
   * Pass the already-parsed JS value (JSON.parse / yaml.load result).
   * Leave undefined to hide the toggle.
   */
  treeData?: unknown;
}

function highlightJson(raw: string): string {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="json-key">${match}</span>`;
        return `<span class="json-str">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
      if (/null/.test(match))       return `<span class="json-null">${match}</span>`;
      return `<span class="json-num">${match}</span>`;
    }
  );
}

function highlightXml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(&lt;\/?)([\w:-]+)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)(&gt;)/g,
      (_, open, tag, attrs, selfClose, close) => {
        const attrHtml = attrs.replace(
          /([\w:-]+)(=)("([^"]*)")/g,
          `<span class="xml-attr-name">$1</span>$2<span class="xml-attr-val">$3</span>`
        );
        return `<span class="xml-bracket">${open}</span><span class="xml-tag">${tag}</span>${attrHtml}${selfClose}<span class="xml-bracket">${close}</span>`;
      }
    )
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span class="xml-comment">$1</span>`);
}

function highlight(code: string, lang: string): string {
  if (!code) return "";
  if (lang === "json") return highlightJson(code);
  if (lang === "xml")  return highlightXml(code);
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HighlightedOutput({
  value,
  language = "text",
  label = "Output",
  filename = "output.txt",
  mimeType = "text/plain",
  className,
  minHeight = "28rem",
  treeData,
}: HighlightedOutputProps) {
  const [copied,   setCopied]   = useState(false);
  const [viewMode, setViewMode] = useState<"raw" | "tree">("raw");

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!value) return;
    const blob = new Blob([value], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const highlighted = language !== "text" ? highlight(value, language) : null;
  const showTree    = !!treeData && viewMode === "tree";

  return (
    <div className={cn("flex flex-col gap-2 h-full", className)}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>

          {/* Raw / Tree toggle — only shown when treeData is provided */}
          {treeData !== undefined && (
            <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode("raw")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  viewMode === "raw"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {"{ }"} Raw
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  viewMode === "tree"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                disabled={!value}
              >
                🌲 Tree
              </button>
            </div>
          )}
        </div>

        {/* Copy + Download */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
            onClick={handleCopy} disabled={!value}
          >
            {copied
              ? <><Check className="h-3 w-3 text-green-500" />Copied</>
              : <><Copy className="h-3 w-3" />Copy</>}
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
            onClick={handleDownload} disabled={!value}
          >
            <Download className="h-3 w-3" />Download
          </Button>
        </div>
      </div>

      {/* Content area */}
      {showTree ? (
        <TreeView data={treeData} className="flex-1" style={{ minHeight }} />
      ) : highlighted ? (
        <div
          className="syntax-block flex-1 w-full overflow-auto rounded-lg border border-border bg-[#1e1e2e] font-mono text-sm"
          style={{ minHeight }}
        >
          <pre
            className="p-4 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                highlighted ||
                '<span class="text-muted-foreground/60">Output will appear here…</span>',
            }}
          />
        </div>
      ) : (
        <textarea
          readOnly
          value={value}
          placeholder="Output will appear here…"
          className="w-full flex-1 min-h-[20rem] resize-y rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
