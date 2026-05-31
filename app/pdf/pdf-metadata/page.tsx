"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, FileText, Copy, Check } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "pdf-metadata")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Status = "idle" | "loading" | "done" | "error";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Parse PDF date string format: "D:20230101120000Z" or "D:20230101120000+05'30'"
 * Returns a human-readable string or "—" if unparseable.
 */
function parsePdfDate(raw: unknown): string {
  if (!raw) return "—";
  const str = String(raw).trim();
  // Remove leading "D:" prefix
  const cleaned = str.startsWith("D:") ? str.slice(2) : str;
  // Extract the numeric portion (14 digits)
  const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return str;
  const [, year, month, day, hour, min, sec] = match;
  try {
    const date = new Date(
      `${year}-${month}-${day}T${hour}:${min}:${sec}Z`
    );
    if (isNaN(date.getTime())) return str;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return str;
  }
}

function str(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v).trim() || "—";
}

interface MetaRow {
  label: string;
  value: string;
}

interface MetaSection {
  title: string;
  rows: MetaRow[];
}

interface PdfInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
  PDFFormatVersion?: string;
  [key: string]: unknown;
}

export default function PdfMetadataPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sections, setSections] = useState<MetaSection[]>([]);
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
    setSections([]);
    setStatus("loading");

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const meta = await pdfDoc.getMetadata();
      const info = (meta.info ?? {}) as PdfInfo;

      const result: MetaSection[] = [];

      // File Info
      result.push({
        title: "File Info",
        rows: [
          { label: "Filename", value: str(f.name) },
          { label: "File size", value: fmtSize(f.size) },
        ],
      });

      // Document Info
      result.push({
        title: "Document Info",
        rows: [
          { label: "Title", value: str(info.Title) },
          { label: "Author", value: str(info.Author) },
          { label: "Subject", value: str(info.Subject) },
          { label: "Keywords", value: str(info.Keywords) },
          { label: "Creator", value: str(info.Creator) },
          { label: "Producer", value: str(info.Producer) },
        ],
      });

      // Dates
      result.push({
        title: "Dates",
        rows: [
          { label: "Creation date", value: parsePdfDate(info.CreationDate) },
          { label: "Modified date", value: parsePdfDate(info.ModDate) },
        ],
      });

      // PDF Properties
      result.push({
        title: "PDF Properties",
        rows: [
          { label: "PDF version", value: str(info.PDFFormatVersion) },
          { label: "Page count", value: String(numPages) },
        ],
      });

      setSections(result);
      setStatus("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("password")) {
        setError("This PDF is password-protected. Please remove the password and try again.");
      } else {
        setError("Failed to read metadata. The file may be corrupt or unsupported.");
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
    setSections([]);
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleCopyAll() {
    const text = sections
      .map((s) => {
        const rows = s.rows.map((r) => `${r.label}: ${r.value}`).join("\n");
        return `[${s.title}]\n${rows}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Drop zone */}
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
            <p className="text-sm font-medium text-muted-foreground">Reading PDF metadata…</p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "55%" }} />
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
        {status === "done" && sections.length > 0 && (
          <div className="space-y-3">
            {/* Action bar */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Metadata
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy all
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Metadata sections */}
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="border-b border-border bg-muted/30 px-4 py-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {section.rows.map((row) => (
                      <div key={row.label} className="flex items-start gap-4 px-4 py-2.5">
                        <span className="w-32 shrink-0 text-xs text-muted-foreground">
                          {row.label}
                        </span>
                        <span
                          className={`text-sm break-all ${row.value === "—" ? "text-muted-foreground" : "text-foreground"}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
