"use client";

import { useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Upload, Copy, Check, Download, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "base64-file-encoder")!;

type Tab = "encode" | "decode";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={copy} disabled={!value}>
      {copied ? (
        <><Check className="h-3 w-3 text-green-500" />Copied</>
      ) : (
        <><Copy className="h-3 w-3" />Copy</>
      )}
    </Button>
  );
}

export default function Base64EncoderPage() {
  const [tab, setTab] = useState<Tab>("encode");

  // Encode state
  const [encFile, setEncFile] = useState<File | null>(null);
  const [encOutput, setEncOutput] = useState("");
  const [encError, setEncError] = useState<string | null>(null);
  const [encLoading, setEncLoading] = useState(false);
  const [encDragging, setEncDragging] = useState(false);
  const encFileRef = useRef<HTMLInputElement>(null);

  // Decode state
  const [decInput, setDecInput] = useState("");
  const [decDataUrl, setDecDataUrl] = useState("");
  const [decMime, setDecMime] = useState("application/octet-stream");
  const [decSize, setDecSize] = useState<number | null>(null);
  const [decError, setDecError] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);

  // ─── Encode helpers ───────────────────────────────────────────────────────

  function encodeFile(file: File) {
    setEncError(null);
    setEncOutput("");
    if (file.size > MAX_SIZE) {
      setEncError(`File is too large. Maximum size is 5 MB (file is ${formatBytes(file.size)}).`);
      setEncFile(null);
      return;
    }
    setEncFile(file);
    setEncLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl format: "data:<mime>;base64,<data>"
      const base64 = dataUrl.split(",")[1] ?? "";
      setEncOutput(base64);
      setEncLoading(false);
    };
    reader.onerror = () => {
      setEncError("Failed to read file. Please try again.");
      setEncLoading(false);
    };
  }

  function handleEncFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) encodeFile(f);
    e.target.value = "";
  }

  function handleEncDrop(e: React.DragEvent) {
    e.preventDefault();
    setEncDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) encodeFile(f);
  }

  function downloadBase64AsTxt() {
    if (!encOutput) return;
    const blob = new Blob([encOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = encFile ? `${encFile.name}.base64.txt` : "encoded.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearEncode() {
    setEncFile(null);
    setEncOutput("");
    setEncError(null);
  }

  // ─── Decode helpers ───────────────────────────────────────────────────────

  function decode() {
    setDecError(null);
    setDecDataUrl("");
    setDecSize(null);
    setIsImage(false);

    const trimmed = decInput.trim();
    if (!trimmed) return;

    try {
      let mime = "application/octet-stream";
      let rawB64 = trimmed;

      // Check if it's a data URL
      if (trimmed.startsWith("data:")) {
        const match = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (!match) throw new Error("Invalid data URL format.");
        mime = match[1];
        rawB64 = match[2];
      }

      // Validate base64
      const cleaned = rawB64.replace(/\s/g, "");
      const decoded = atob(cleaned); // throws on invalid
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      setDecMime(mime);
      setDecSize(bytes.length);
      const dataUrl = `data:${mime};base64,${cleaned}`;
      setDecDataUrl(dataUrl);
      setIsImage(mime.startsWith("image/"));
    } catch {
      setDecError("Invalid Base64 string. Please check your input and try again.");
    }
  }

  function downloadDecoded() {
    if (!decDataUrl) return;
    const a = document.createElement("a");
    a.href = decDataUrl;
    // Guess extension from MIME
    const ext = decMime.split("/")[1]?.split("+")[0] ?? "bin";
    a.download = `decoded.${ext}`;
    a.click();
  }

  function clearDecode() {
    setDecInput("");
    setDecDataUrl("");
    setDecSize(null);
    setDecError(null);
    setIsImage(false);
  }

  // ─── Tab switch ───────────────────────────────────────────────────────────

  function switchTab(t: Tab) {
    setTab(t);
    clearEncode();
    clearDecode();
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Tab toggle */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
          {(["encode", "decode"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── ENCODE TAB ─────────────────────────────────────────────────── */}
        {tab === "encode" && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleEncDrop}
              onDragOver={(e) => { e.preventDefault(); setEncDragging(true); }}
              onDragLeave={() => setEncDragging(false)}
              onClick={() => encFileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
                encDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
              )}
            >
              <Upload className="h-9 w-9 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Drop any file here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Any file type · Max 5 MB</p>
              </div>
              <input
                ref={encFileRef}
                type="file"
                className="hidden"
                onChange={handleEncFileInput}
              />
            </div>

            {/* Error */}
            {encError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {encError}
              </div>
            )}

            {/* File info */}
            {encFile && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{encFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(encFile.size)}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={clearEncode}>
                  Clear
                </Button>
              </div>
            )}

            {/* Loading */}
            {encLoading && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                Encoding…
              </p>
            )}

            {/* Output */}
            {encOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Base64 Output</label>
                  <div className="flex items-center gap-1.5">
                    <CopyButton value={encOutput} />
                    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={downloadBase64AsTxt}>
                      <Download className="h-3 w-3" />Download .txt
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={encOutput}
                  rows={8}
                  className="w-full resize-y rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-xs outline-none break-all"
                />
                <p className="text-xs text-muted-foreground">
                  Encoded size: {formatBytes(encOutput.length)} (base64 characters)
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── DECODE TAB ─────────────────────────────────────────────────── */}
        {tab === "decode" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Base64 Input</label>
              </div>
              <textarea
                value={decInput}
                onChange={(e) => { setDecInput(e.target.value); setDecDataUrl(""); setDecError(null); setDecSize(null); setIsImage(false); }}
                placeholder={"Paste raw Base64 or a data URL (e.g. data:image/png;base64,...)"}
                rows={8}
                className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors break-all"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={decode} disabled={!decInput.trim()}>
                Decode
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDecode}
                className="ml-auto"
                disabled={!decInput && !decDataUrl}
              >
                Clear
              </Button>
            </div>

            {/* Error */}
            {decError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {decError}
              </div>
            )}

            {/* Decoded result */}
            {decDataUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium">
                      Decoded successfully
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MIME: <span className="font-mono">{decMime}</span>
                      {decSize !== null && (
                        <> · Size: {formatBytes(decSize)}</>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs shrink-0" onClick={downloadDecoded}>
                    <Download className="h-3 w-3" />Download
                  </Button>
                </div>

                {/* Image preview */}
                {isImage && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={decDataUrl}
                      alt="Decoded image preview"
                      className="max-h-80 max-w-full rounded object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
