"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OutputAreaProps {
  value: string;
  label?: string;
  filename?: string;
  mimeType?: string;
  rows?: number;
  className?: string;
  mono?: boolean;
  placeholder?: string;
}

export function OutputArea({
  value,
  label = "Output",
  filename = "output.txt",
  mimeType = "text/plain",
  rows = 14,
  className,
  mono = true,
  placeholder = "Output will appear here...",
}: OutputAreaProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!value) return;
    const blob = new Blob([value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleCopy}
            disabled={!value}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleDownload}
            disabled={!value}
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </div>

      <textarea
        value={value}
        readOnly
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "w-full resize-y rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none",
          "placeholder:text-muted-foreground",
          mono && "font-mono"
        )}
        spellCheck={false}
      />
    </div>
  );
}
