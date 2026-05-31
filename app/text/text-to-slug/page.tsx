"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "text-to-slug")!;

function toSlug(text: string, separator: "-" | "_"): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");
}

export default function TextToSlugPage() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSlug(input ? toSlug(input, separator) : "");
  }, [input, separator]);

  async function handleCopy() {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input Text</label>
            <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. My Awesome Blog Post Title"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Separator:</span>
            {(["-", "_"] as const).map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`rounded-md border px-3 py-1 text-sm font-mono transition-colors ${
                  separator === sep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {sep === "-" ? "hyphen (-)" : "underscore (_)"}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Slug</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-sm min-h-[2.5rem] break-all text-primary">
              {slug || <span className="text-muted-foreground">Your slug will appear here…</span>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!slug}
              className="shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
