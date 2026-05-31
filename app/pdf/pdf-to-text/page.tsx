"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, FileText, Copy, Download, Check } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "pdf-to-text")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Status = "idle" | "loading" | "done" | "error";

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export default function PdfToTextPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setStatus("error");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10 MB.");
      setStatus("error");
      return;
    }

    setError("");
    setExtractedText("");
    setFileName(f.name);
    setStatus("loading");

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pageTexts: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const tc = await page.getTextContent();
        const pageText = tc.items
          .filter((item) => "str" in item)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item) => (item as any).str as string)
          .join(" ")
          .trim();
        pageTexts.push(`--- Page ${i} ---\n${pageText}`);
      }

      setExtractedText(pageTexts.join("\n\n"));
      setStatus("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("password")) {
        setError("This PDF is password-protected. Please remove the password and try again.");
      } else {
        setError("Failed to extract text. The file may be corrupt or unsupported.");
      }
      setStatus("error");
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleClear() {
    setStatus("idle");
    setError("");
    setExtractedText("");
    setFileName("");
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const charCount = extractedText.length;
  const wordCount = countWords(extractedText);

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Drop zone — always visible when idle or error */}
        {(status === "idle" || status === "error") && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-16 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop a PDF here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF only — max 10 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16">
            <p className="text-sm font-medium text-muted-foreground">Extracting text from {fileName}…</p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
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

        {/* Results */}
        {status === "done" && (
          <div className="space-y-3">
            {/* File info + stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-medium truncate max-w-xs">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {charCount.toLocaleString()} characters &middot; {wordCount.toLocaleString()} words
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Download .txt
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Extracted text */}
            <div className="rounded-lg border border-border bg-muted/20">
              <pre className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap break-words p-4 text-sm leading-relaxed text-foreground">
                {extractedText || (
                  <span className="text-muted-foreground italic">No text content found in this PDF.</span>
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
