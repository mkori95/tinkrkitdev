"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle, ImageIcon, Info } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "jpg-to-heic")!;
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const QUALITY_OPTIONS = [
  { label: "72%", value: 0.72 },
  { label: "85%", value: 0.85 },
  { label: "92% (recommended)", value: 0.92 },
] as const;

type QualityValue = (typeof QUALITY_OPTIONS)[number]["value"];

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Try canvas.toBlob with image/heic — returns null on unsupported browsers */
function encodeToHeic(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/heic", quality);
  });
}

export default function JpgToHeicPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityValue>(0.92);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error" | "unsupported">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "image/jpeg") {
      setError("Please upload a JPG / JPEG image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 20 MB.");
      return;
    }
    setError("");
    setResultBlob(null);
    setResultUrl(null);
    setStatus("idle");
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
  }, []);

  function convert(f: File, q: QualityValue) {
    setStatus("converting");
    setResultBlob(null);
    setResultUrl(null);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const blob = await encodeToHeic(canvas, q);

      if (!blob) {
        // Browser does not support image/heic encoding
        setStatus("unsupported");
        return;
      }

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
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

  function handleConvert() {
    if (file) convert(file, quality);
  }

  function handleDownload() {
    if (!resultUrl || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${baseName}.heic`;
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
        {/* Browser support notice */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Safari only:</span> HEIC encoding is a native Apple format. This tool works on Safari (macOS / iOS). Chrome and Firefox do not support browser-based HEIC encoding.
          </span>
        </div>

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
              <p className="text-sm font-medium">Drop a JPG image here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">JPG / JPEG — max 20 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="max-w-[200px] truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground shrink-0">{fmtSize(file.size)}</span>
              </div>
              <span className="text-sm font-medium">Quality:</span>
              <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    className={`px-3 py-1.5 transition-colors ${
                      quality === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <Button onClick={handleConvert} disabled={status === "converting"}>
                  {status === "converting" ? "Converting…" : "Convert to HEIC"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Original preview */}
            {originalUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Original (JPG)</label>
                <div className="flex max-h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Original JPG" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}

            {status === "converting" && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-spin text-base">⏳</span>
                Encoding to HEIC…
              </div>
            )}

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
                  Download HEIC
                </Button>
              </div>
            )}

            {status === "unsupported" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 space-y-2">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  ⚠ HEIC encoding not supported in this browser
                </p>
                <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
                  Your current browser doesn&apos;t support native HEIC encoding. To convert JPG to HEIC:
                </p>
                <ul className="text-sm text-amber-700/80 dark:text-amber-300/80 list-disc list-inside space-y-1">
                  <li>Open this page in <strong>Safari on macOS or iOS</strong> and try again</li>
                  <li>Use Apple&apos;s <strong>Photos app</strong> on Mac — it can export to HEIC</li>
                  <li>Use <strong>Preview app</strong> on macOS → Export → HEIC</li>
                </ul>
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

        {/* Info callout */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">About HEIC</p>
          <p>HEIC uses HEVC (H.265) compression — the same codec used for 4K video. It achieves roughly 2× better compression than JPG at the same visual quality. HEIC is the default photo format on iPhones running iOS 11+.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
