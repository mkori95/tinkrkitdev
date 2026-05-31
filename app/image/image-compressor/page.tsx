"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";

const tool = TOOLS.find((t) => t.slug === "image-compressor")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const PRESETS = {
  high:   { maxSizeMB: 2,   maxWidthOrHeight: 4096, label: "High Quality" },
  medium: { maxSizeMB: 0.5, maxWidthOrHeight: 1920, label: "Medium (Recommended)" },
  low:    { maxSizeMB: 0.1, maxWidthOrHeight: 1280, label: "Small File Size" },
} as const;

type Preset = keyof typeof PRESETS;

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorPage() {
  const [original, setOriginal] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("medium");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "compressing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    setError("");
    setCompressed(null);
    setCompressedUrl(null);
    setStatus("idle");
    setOriginal(file);
    setOriginalUrl(URL.createObjectURL(file));
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleCompress() {
    if (!original) return;
    setStatus("compressing");
    setProgress(0);
    setError("");
    try {
      const result = await imageCompression(original, {
        ...PRESETS[preset],
        useWebWorker: true,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(result);
      setCompressed(result);
      setCompressedUrl(url);
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }

  function handleDownload() {
    if (!compressedUrl || !original) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `compressed-${original.name}`;
    a.click();
  }

  function handleClear() {
    setOriginal(null);
    setOriginalUrl(null);
    setCompressed(null);
    setCompressedUrl(null);
    setStatus("idle");
    setError("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  const savings =
    original && compressed
      ? Math.round((1 - compressed.size / original.size) * 100)
      : 0;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Upload zone */}
        {!original ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-16 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop an image here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP — max 10 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preset selector + actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Quality:</span>
              <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                {(Object.keys(PRESETS) as Preset[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`px-3 py-1.5 transition-colors ${
                      preset === key
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {PRESETS[key].label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <Button onClick={handleCompress} disabled={status === "compressing"}>
                  {status === "compressing"
                    ? `Compressing… ${progress}%`
                    : "Compress"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            {status === "compressing" && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Before / After */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Original</label>
                  <span className="text-xs text-muted-foreground">{fmtSize(original.size)}</span>
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl!} alt="Original" className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Compressed</label>
                  {compressed && (
                    <span className="text-xs text-muted-foreground">{fmtSize(compressed.size)}</span>
                  )}
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {compressedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={compressedUrl} alt="Compressed" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {status === "compressing" ? "Compressing…" : "Preview will appear here"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Result */}
            {status === "done" && compressed && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Saved {savings}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {fmtSize(original.size)} → {fmtSize(compressed.size)}
                </span>
                <Button size="sm" className="ml-auto gap-1.5" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
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
