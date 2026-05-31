"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle, ImageIcon, Lock, Unlock } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "image-resizer")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [locked, setLocked] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "resizing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setError("");
    setResultBlob(null);
    setResultUrl(null);
    setStatus("idle");
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.src = url;
  }, []);

  // Keep ratio in sync when width changes
  function handleWidthChange(val: string) {
    setWidth(val);
    if (locked && origW > 0 && origH > 0) {
      const numW = parseInt(val, 10);
      if (!isNaN(numW) && numW > 0) {
        setHeight(String(Math.round((numW / origW) * origH)));
      }
    }
  }

  // Keep ratio in sync when height changes
  function handleHeightChange(val: string) {
    setHeight(val);
    if (locked && origW > 0 && origH > 0) {
      const numH = parseInt(val, 10);
      if (!isNaN(numH) && numH > 0) {
        setWidth(String(Math.round((numH / origH) * origW)));
      }
    }
  }

  // Reset dimensions to original when lock is toggled back on
  useEffect(() => {
    if (locked && origW > 0) {
      setWidth(String(origW));
      setHeight(String(origH));
    }
  }, [locked, origW, origH]);

  function handleResize() {
    if (!file || !originalUrl) return;
    const newW = parseInt(width, 10);
    const newH = parseInt(height, 10);
    if (isNaN(newW) || isNaN(newH) || newW <= 0 || newH <= 0) {
      setError("Please enter valid positive dimensions.");
      return;
    }
    if (newW > 10000 || newH > 10000) {
      setError("Maximum dimension is 10,000 px.");
      return;
    }
    setStatus("resizing");
    setError("");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, newW, newH);
      const mimeType = file.type || "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Resize failed. Please try a different image.");
            setStatus("error");
            return;
          }
          setResultBlob(blob);
          setResultUrl(URL.createObjectURL(blob));
          setStatus("done");
        },
        mimeType,
        0.92
      );
    };
    img.onerror = () => {
      setError("Could not load image for resizing.");
      setStatus("error");
    };
    img.src = originalUrl;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  function handleDownload() {
    if (!resultUrl || !file) return;
    const ext = file.name.split(".").pop() ?? "png";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `resized-${baseName}.${ext}`;
    a.click();
  }

  function handleClear() {
    setFile(null);
    setOriginalUrl(null);
    setOrigW(0);
    setOrigH(0);
    setWidth("");
    setHeight("");
    setResultBlob(null);
    setResultUrl(null);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {!file ? (
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
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF — max 10 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dimension controls */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Resize dimensions</p>
                <span className="text-xs text-muted-foreground">
                  Original: {origW} × {origH} px
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground w-12">Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    min={1}
                    max={10000}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>

                <button
                  onClick={() => setLocked((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
                  title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground w-12">Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    min={1}
                    max={10000}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>

                <div className="ml-auto flex gap-2">
                  <Button onClick={handleResize} disabled={status === "resizing"}>
                    {status === "resizing" ? "Resizing…" : "Resize"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </div>
              {locked && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Aspect ratio locked
                </p>
              )}
            </div>

            {/* Before / After preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Original</label>
                  <span className="text-xs text-muted-foreground">
                    {origW} × {origH} px · {fmtSize(file.size)}
                  </span>
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl!} alt="Original" className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Resized</label>
                  {resultBlob && (
                    <span className="text-xs text-muted-foreground">
                      {parseInt(width, 10)} × {parseInt(height, 10)} px · {fmtSize(resultBlob.size)}
                    </span>
                  )}
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resultUrl} alt="Resized" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {status === "resizing" ? "Resizing…" : "Click Resize to preview"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {status === "done" && resultBlob && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Resize complete
                </span>
                <span className="text-sm text-muted-foreground">
                  {origW} × {origH} → {parseInt(width, 10)} × {parseInt(height, 10)} px
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
