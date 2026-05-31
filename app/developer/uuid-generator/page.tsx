"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "uuid-generator")!;

function generateUuids(count: number, upper: boolean): string[] {
  return Array.from({ length: count }, () => {
    const id = crypto.randomUUID();
    return upper ? id.toUpperCase() : id;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [allCopied, setAllCopied] = useState(false);

  function generate() {
    setUuids(generateUuids(Math.max(1, Math.min(20, count)), upper));
  }

  async function copyAll() {
    if (!uuids.length) return;
    await navigator.clipboard.writeText(uuids.join("\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }

  function clear() {
    setUuids([]);
    setCount(5);
    setUpper(false);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Number of UUIDs</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input
              type="checkbox"
              checked={upper}
              onChange={(e) => setUpper(e.target.checked)}
              className="rounded border-border"
            />
            Uppercase
          </label>

          <Button onClick={generate} className="gap-2 mb-1">
            <RefreshCw className="h-4 w-4" />
            Generate UUIDs
          </Button>

          {uuids.length > 0 && (
            <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5 mb-1">
              {allCopied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copied all</> : <><Copy className="h-3.5 w-3.5" />Copy all</>}
            </Button>
          )}

          {uuids.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} className="mb-1">
              Clear
            </Button>
          )}
        </div>

        {/* UUID list */}
        {uuids.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/60 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Generated UUIDs ({uuids.length})
              </span>
              <span className="text-xs text-muted-foreground">UUID v4</span>
            </div>
            <div className="divide-y divide-border">
              {uuids.map((id, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                  <span className={cn("flex-1 font-mono text-sm", upper ? "text-primary" : "")}>
                    {id}
                  </span>
                  <CopyButton text={id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">UUID v4 Format</p>
          <p className="font-mono text-xs">xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
          <p className="mt-1 text-xs">
            128-bit randomly generated identifier. The &quot;4&quot; indicates UUID version 4. Uses{" "}
            <code className="font-mono">crypto.randomUUID()</code> for cryptographically secure generation.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
