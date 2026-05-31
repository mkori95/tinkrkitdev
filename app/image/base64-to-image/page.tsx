"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "base64-to-image")!;

function parseInput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function getMimeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : "image/png";
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/tiff": "tiff",
    "image/bmp": "bmp",
  };
  return map[mime] ?? "png";
}

function isValidBase64(str: string): boolean {
  try {
    // Remove data URI prefix if present
    const b64 = str.startsWith("data:") ? str.split(",")[1] : str;
    if (!b64) return false;
    return /^[A-Za-z0-9+/]*={0,2}$/.test(b64.trim()) && b64.trim().length > 0;
  } catch {
    return false;
  }
}

export default function Base64ToImagePage() {
  const [input, setInput] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  function handleDecode() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please paste a Base64 string or data URI.");
      return;
    }
    if (!isValidBase64(trimmed)) {
      setError("Invalid Base64 string. Please check your input.");
      return;
    }
    setError("");
    setLoaded(false);
    setDataUrl(parseInput(trimmed));
  }

  function handleImageLoad() {
    setLoaded(true);
  }

  function handleImageError() {
    setError("Could not decode image. The Base64 string may be invalid or the format is not supported.");
    setDataUrl(null);
    setLoaded(false);
  }

  function handleDownload() {
    if (!dataUrl) return;
    const mime = getMimeFromDataUrl(dataUrl);
    const ext = getExtFromMime(mime);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `decoded-image.${ext}`;
    a.click();
  }

  function handleClear() {
    setInput("");
    setDataUrl(null);
    setError("");
    setLoaded(false);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Input textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base64 string or Data URI</label>
            {input && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
              setLoaded(false);
              setDataUrl(null);
            }}
            rows={6}
            placeholder="Paste Base64 string (e.g. iVBORw0KGgo...) or full data URI (data:image/png;base64,...)"
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <Button onClick={handleDecode} disabled={!input.trim()}>
          Decode Image
        </Button>

        {/* Preview */}
        {dataUrl && (
          <div className="space-y-4">
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="Decoded"
                className="max-h-full max-w-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {loaded && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Image decoded successfully
                </span>
                <span className="text-sm text-muted-foreground">
                  {getMimeFromDataUrl(dataUrl)}
                </span>
                <Button size="sm" className="ml-auto gap-1.5" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
