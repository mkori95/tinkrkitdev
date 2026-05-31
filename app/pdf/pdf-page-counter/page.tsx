"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, FileText, Copy, Check } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "pdf-page-counter")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Status = "idle" | "loading" | "error";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface PdfResult {
  id: number;
  fileName: string;
  fileSize: number;
  pageCount: number;
  copied: boolean;
}

export default function PdfPageCounterPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<PdfResult[]>([]);
  const [processingName, setProcessingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setStatus("error");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`"${f.name}" is too large. Maximum size is 10 MB.`);
      setStatus("error");
      return;
    }

    setError("");
    setProcessingName(f.name);
    setStatus("loading");

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const pageCount = pdfDoc.numPages;

      setResults((prev) => [
        ...prev,
        {
          id: nextId.current++,
          fileName: f.name,
          fileSize: f.size,
          pageCount,
          copied: false,
        },
      ]);
      setStatus("idle");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("password")) {
        setError(`"${f.name}" is password-protected. Please remove the password and try again.`);
      } else {
        setError(`Failed to read "${f.name}". The file may be corrupt or unsupported.`);
      }
      setStatus("error");
    } finally {
      setProcessingName("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Process files sequentially
      Array.from(files).forEach((f) => handleFile(f));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((f) => handleFile(f));
    }
  }

  async function handleCopy(id: number, count: number) {
    await navigator.clipboard.writeText(String(count));
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, copied: true } : r))
    );
    setTimeout(() => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, copied: false } : r))
      );
    }, 2000);
  }

  function handleRemove(id: number) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  function handleClearAll() {
    setResults([]);
    setError("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop PDF files here or click to upload</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF only — max 10 MB per file. Multiple files supported.</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-4">
            <p className="text-sm text-muted-foreground">Counting pages in {processingName}…</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "50%" }} />
            </div>
          </div>
        )}

        {/* Error message */}
        {status === "error" && error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {results.length} file{results.length !== 1 ? "s" : ""} processed
              </p>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={handleClearAll}>
                Clear all
              </Button>
            </div>

            {results.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
              >
                {/* Page count — prominent */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 px-6 py-4 min-w-[100px]">
                  <span className="text-4xl font-bold tabular-nums text-primary">{r.pageCount}</span>
                  <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {r.pageCount === 1 ? "page" : "pages"}
                  </span>
                </div>

                {/* File details */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{r.fileName}</p>
                  <p className="text-xs text-muted-foreground">{fmtSize(r.fileSize)}</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCopy(r.id, r.pageCount)}
                  >
                    {r.copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy count
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(r.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
