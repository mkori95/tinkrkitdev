"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "webp-to-jpg")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function WebpToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "image/webp") {
      setError("Please upload a WebP image.");
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
    setOriginalUrl(URL.createObjectURL(f));
    convert(f);
  }, []);

  function convert(f: File) {
    setStatus("converting");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Conversion failed. Please try a different image.");
            setStatus("error");
            return;
          }
          setResultBlob(blob);
          setResultUrl(URL.createObjectURL(blob));
          setStatus("done");
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      setError("Could not load image. Please try a different file.");
      setStatus("error");
    };
    img.src = URL.createObjectURL(f);
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
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `converted-${baseName}.jpg`;
    a.click();
  }

  function handleClear() {
    setFile(null);
    setOriginalUrl(null);
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
              <p className="text-sm font-medium">Drop a WebP image here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">WebP — max 10 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Original (WebP)</label>
                  <span className="text-xs text-muted-foreground">{fmtSize(file.size)}</span>
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl!} alt="Original" className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Converted (JPG)</label>
                  {resultBlob && (
                    <span className="text-xs text-muted-foreground">{fmtSize(resultBlob.size)}</span>
                  )}
                </div>
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resultUrl} alt="Converted JPG" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {status === "converting" ? "Converting…" : "Preview will appear here"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {status === "done" && resultBlob && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Conversion complete
                </span>
                <span className="text-sm text-muted-foreground">
                  {fmtSize(file.size)} → {fmtSize(resultBlob.size)}
                </span>
                <Button size="sm" className="ml-auto gap-1.5" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download JPG
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
