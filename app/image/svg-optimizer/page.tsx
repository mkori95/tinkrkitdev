"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, Copy, AlertCircle, CheckCircle, Upload } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "svg-optimizer")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <!-- Example SVG -->
  <g id="" style="">
    <circle cx="12" cy="12" r="10" fill="blue" />
  </g>
</svg>`;

function optimizeSvg(input: string): string {
  let out = input;
  // Remove XML comments
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  // Remove empty id attributes
  out = out.replace(/\s+id=""/g, "");
  // Remove empty style attributes
  out = out.replace(/\s+style=""/g, "");
  // Remove empty class attributes
  out = out.replace(/\s+class=""/g, "");
  // Remove empty groups
  out = out.replace(/<g>\s*<\/g>/g, "");
  // Collapse multiple spaces to single space in attributes
  out = out.replace(/([a-zA-Z-]+)="([^"]*)"/g, (match, attr, val) => {
    return `${attr}="${val.replace(/\s+/g, " ").trim()}"`;
  });
  // Remove xmlns:xlink if xlink: is not used
  if (!out.includes("xlink:")) {
    out = out.replace(/\s+xmlns:xlink="[^"]*"/g, "");
  }
  // Collapse whitespace between tags
  out = out.replace(/>\s+</g, "><");
  // Trim each line and remove blank lines
  out = out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  return out;
}

export default function SvgOptimizerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOptimize = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter SVG code or upload an SVG file.");
      return;
    }
    if (!trimmed.includes("<svg")) {
      setError("Input does not appear to be valid SVG. Make sure it contains an <svg> element.");
      return;
    }
    setError("");
    try {
      const optimized = optimizeSvg(trimmed);
      setOutput(optimized);
    } catch {
      setError("Failed to optimize SVG. Please check your input.");
    }
  }, [input]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".svg") && f.type !== "image/svg+xml") {
      setError("Please upload an SVG file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string ?? "");
      setOutput("");
      setError("");
    };
    reader.readAsText(f);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const inputLen = input.length;
  const outputLen = output.length;
  const savings =
    inputLen > 0 && outputLen > 0
      ? Math.round((1 - outputLen / inputLen) * 100)
      : 0;

  // Build safe SVG preview using data URI
  const svgPreviewSrc =
    output
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`
      : input
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(input)}`
      : null;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium">SVG Input</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Upload SVG
              </Button>
              {input && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleFileUpload}
          />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
              setError("");
            }}
            rows={8}
            placeholder={PLACEHOLDER}
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">{inputLen.toLocaleString()} characters</p>
        </div>

        <Button onClick={handleOptimize} disabled={!input.trim()}>
          Optimize SVG
        </Button>

        {/* Output */}
        {output && (
          <div className="space-y-4">
            {/* Stats banner */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {savings > 0 ? `Saved ${savings}%` : "Optimized"}
              </span>
              <span className="text-sm text-muted-foreground">
                {inputLen.toLocaleString()} → {outputLen.toLocaleString()} chars
              </span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>

            {/* SVG Preview */}
            {svgPreviewSrc && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={svgPreviewSrc}
                    alt="SVG Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Optimized output */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Optimized SVG</label>
              <textarea
                readOnly
                value={output}
                rows={8}
                className="w-full resize-y rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
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
