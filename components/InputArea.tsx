"use client";

import { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function fmtBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${bytes / 1024 / 1024}MB`;
  return `${bytes / 1024}KB`;
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

export function InputArea({
  value,
  onChange,
  placeholder = "Paste your content here...",
  label = "Input",
  accept,
  onFileLoad,
  rows = 14,
  className,
  mono = true,
  maxSizeBytes,
}: InputAreaProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  function checkSize(byteLength: number): boolean {
    if (!maxSizeBytes) return true;
    if (byteLength > maxSizeBytes) {
      setSizeError(`File too large. Maximum size is ${fmtBytes(maxSizeBytes)}.`);
      return false;
    }
    setSizeError(null);
    return true;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!checkSize(file.size)) return;          // ← reject before reading

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
    // byte length approximation (UTF-8 worst case ×4 is too strict; use char count)
    if (!checkSize(val.length)) return;         // ← reject without propagating
    onChange(val);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {accept && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => fileRef.current?.click()}
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
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-sm outline-none",
          "placeholder:text-muted-foreground transition-colors",
          "focus:ring-2 focus:ring-primary/30 focus:border-primary",
          sizeError ? "border-destructive/60" : "border-border",
          mono && "font-mono"
        )}
        spellCheck={false}
      />

      {sizeError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {sizeError}
        </div>
      )}
    </div>
  );
}
