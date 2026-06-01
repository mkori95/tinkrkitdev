"use client";

import { useRef, useState } from "react";
import { Upload, AlertCircle, Link, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function fmtBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  accept?: string;
  onFileLoad?: (content: string, file: File) => void;
  rows?: number;
  className?: string;
  mono?: boolean;
  /** Hard limit in bytes. File uploads AND paste are rejected if exceeded. */
  maxSizeBytes?: number;
}

type InputMode = "paste" | "url";

export function InputArea({
  value,
  onChange,
  placeholder = "Paste your content here...",
  label = "Input",
  accept,
  onFileLoad,
  rows = 20,
  className,
  mono = true,
  maxSizeBytes,
}: InputAreaProps) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError]   = useState<string | null>(null);
  const [mode, setMode]             = useState<InputMode>("paste");
  const [urlValue, setUrlValue]     = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError]     = useState<string | null>(null);

  // ── Size validation ───────────────────────────────────────────────────────

  function checkSize(byteLength: number): boolean {
    if (!maxSizeBytes) return true;
    if (byteLength > maxSizeBytes) {
      setSizeError(`Content too large. Maximum size is ${fmtBytes(maxSizeBytes)}.`);
      return false;
    }
    setSizeError(null);
    return true;
  }

  // ── File upload ───────────────────────────────────────────────────────────

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!checkSize(file.size)) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange(text);
      onFileLoad?.(text, file);
    };
    reader.readAsText(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (!checkSize(val.length)) return;
    onChange(val);
  }

  // ── URL loading ───────────────────────────────────────────────────────────

  async function loadFromUrl() {
    const url = urlValue.trim();
    if (!url) return;
    setUrlLoading(true);
    setUrlError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      if (maxSizeBytes && text.length > maxSizeBytes) {
        setUrlError(`Response too large. Maximum is ${fmtBytes(maxSizeBytes)}.`);
        return;
      }
      onChange(text);
      setMode("paste"); // switch back to paste view so user sees the loaded content
    } catch (err) {
      if (err instanceof TypeError) {
        // fetch() throws TypeError for CORS / network failures
        setUrlError(
          "Could not load this URL — likely blocked by CORS restrictions. " +
          "Try downloading the file and uploading it instead."
        );
      } else {
        setUrlError(`Failed to load: ${(err as Error).message}`);
      }
    } finally {
      setUrlLoading(false);
    }
  }

  function handleUrlKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") loadFromUrl();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col gap-2 h-full", className)}>
      {/* Header: label + action row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>

        <div className="flex items-center gap-1.5">
          {/* Upload file button */}
          {accept && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => { fileRef.current?.click(); setUrlError(null); }}
                title="Upload file"
              >
                <Upload className="h-3 w-3" />
                Upload file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFile}
              />
            </>
          )}

          {/* Load from URL toggle */}
          <Button
            variant={mode === "url" ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => { setMode(m => m === "url" ? "paste" : "url"); setUrlError(null); }}
            title="Load content from a URL"
          >
            <Link className="h-3 w-3" />
            Load URL
          </Button>
        </div>
      </div>

      {/* URL input row (shown when url mode active) */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="https://example.com/data.json"
            className={cn(
              "flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
              urlError && "border-destructive/60"
            )}
            autoFocus
          />
          <Button
            size="sm"
            onClick={loadFromUrl}
            disabled={!urlValue.trim() || urlLoading}
            className="gap-1.5 shrink-0"
          >
            {urlLoading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</>
              : "Load"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setMode("paste"); setUrlError(null); }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* URL error */}
      {urlError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {urlError}
        </div>
      )}

      {/* Textarea (always visible — shows the current value) */}
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full flex-1 min-h-[20rem] resize-y rounded-lg border bg-card px-3 py-2.5 text-sm outline-none",
          "placeholder:text-muted-foreground transition-colors",
          "focus:ring-2 focus:ring-primary/30 focus:border-primary",
          sizeError ? "border-destructive/60" : "border-border",
          mono && "font-mono"
        )}
        spellCheck={false}
      />

      {/* Size error */}
      {sizeError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {sizeError}
        </div>
      )}
    </div>
  );
}
