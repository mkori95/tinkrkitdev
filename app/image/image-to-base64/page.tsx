"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "image-to-base64")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageToBase64Page() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [base64, setBase64] = useState("");
  const [copiedDataUrl, setCopiedDataUrl] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);
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
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setDataUrl("");
    setBase64("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDataUrl(result);
      const b64 = result.split(",")[1] ?? "";
      setBase64(b64);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(f);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function copyText(text: string, setCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function handleClear() {
    setFile(null);
    setPreviewUrl(null);
    setDataUrl("");
    setBase64("");
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
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF, SVG — max 10 MB</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{file.name} · {fmtSize(file.size)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>

            {/* Preview */}
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl!} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            {dataUrl && (
              <>
                {/* Data URI */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Data URI</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{fmtSize(dataUrl.length)} chars</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => copyText(dataUrl, setCopiedDataUrl)}
                      >
                        <Copy className="h-3 w-3" />
                        {copiedDataUrl ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={dataUrl}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Raw Base64 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Base64 string (no prefix)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{fmtSize(base64.length)} chars</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => copyText(base64, setCopiedBase64)}
                      >
                        <Copy className="h-3 w-3" />
                        {copiedBase64 ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={base64}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </>
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
