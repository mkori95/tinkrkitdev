"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Download, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "heic-to-png")!;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function HeicToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isHeic = (f: File) =>
    f.type === "image/heic" ||
    f.type === "image/heif" ||
    /\.(heic|heif)$/i.test(f.name);

  const handleFile = useCallback((f: File) => {
    if (!isHeic(f)) {
      setError("Please upload a HEIC or HEIF image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 25 MB.");
      return;
    }
    setError("");
    setResultBlob(null);
    setResultUrl(null);
    setStatus("idle");
    setFile(f);
  }, []);

  async function convert(f: File) {
    setStatus("converting");
    setResultBlob(null);
    setResultUrl(null);
    try {
      const heic2any = (await import("heic2any")).default;
      const result = await heic2any({ blob: f, toType: "image/png" });
      const blob = Array.isArray(result) ? result[0] : result;
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch {
      setError("Conversion failed. Make sure the file is a valid HEIC/HEIF image.");
      setStatus("error");
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  function handleConvert() {
    if (file) convert(file);
  }

  function handleDownload() {
    if (!resultUrl || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${baseName}.png`;
    a.click();
  }

  function handleClear() {
    setFile(null);
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
              <p className="text-sm font-medium">Drop a HEIC image here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">HEIC / HEIF — max 25 MB · Lossless PNG output</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".heic,.heif,image/heic,image/heif"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File info + controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="max-w-[200px] truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground shrink-0">{fmtSize(file.size)}</span>
              </div>
              <p className="text-xs text-muted-foreground">PNG output is lossless — no quality settings needed</p>
              <div className="ml-auto flex gap-2">
                <Button onClick={handleConvert} disabled={status === "converting"}>
                  {status === "converting" ? "Converting…" : "Convert to PNG"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Result preview */}
            {resultUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Converted (PNG)</label>
                <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="Converted PNG" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}

            {status === "converting" && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-spin text-base">⏳</span>
                Decoding HEIC and converting to PNG…
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
                  Download PNG
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

        {/* Info callout */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Why convert HEIC to PNG?</p>
          <p>PNG is a lossless format — no image quality is lost. Choose PNG when you need perfect fidelity (screenshots, graphics, logos) or when the image contains transparency. For photos shared online, JPG is usually a better choice for smaller file size.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
