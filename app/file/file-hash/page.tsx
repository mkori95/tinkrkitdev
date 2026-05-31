"use client";

import { useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CryptoJS from "crypto-js";

const tool = TOOLS.find((t) => t.slug === "file-hash")!;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface HashResult {
  MD5: string;
  "SHA-1": string;
  "SHA-256": string;
}

function HashRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground pt-0.5">
        {label}
      </span>
      <span className="flex-1 font-mono text-xs break-all text-foreground leading-relaxed">
        {value || <span className="text-muted-foreground/60">—</span>}
      </span>
      <button
        onClick={copy}
        disabled={!value}
        title="Copy hash"
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export default function FileHashPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function processFile(f: File) {
    setError(null);
    setHashes(null);
    if (f.size > MAX_SIZE) {
      setError(`File is too large. Maximum size is 10 MB (file is ${formatBytes(f.size)}).`);
      setFile(null);
      return;
    }
    setFile(f);
    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const wordArray = CryptoJS.lib.WordArray.create(buffer as unknown as number[]);
      setHashes({
        MD5: CryptoJS.MD5(wordArray).toString(),
        "SHA-1": CryptoJS.SHA1(wordArray).toString(),
        "SHA-256": CryptoJS.SHA256(wordArray).toString(),
      });
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setLoading(false);
    };
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function clear() {
    setFile(null);
    setHashes(null);
    setError(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
          )}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Drop any file here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">Any file type · Max 10 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* File info */}
        {file && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={clear}>
              Clear
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center text-sm text-muted-foreground animate-pulse">
            Computing hashes…
          </p>
        )}

        {/* Hash results */}
        {hashes && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/60 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hash Results
              </span>
            </div>
            <div className="px-4">
              {(["MD5", "SHA-1", "SHA-256"] as const).map((algo) => (
                <HashRow key={algo} label={algo} value={hashes[algo]} />
              ))}
            </div>
          </div>
        )}

        {!file && !error && (
          <p className="text-center text-sm text-muted-foreground">
            All computation is done entirely in your browser. No files are uploaded to any server.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
