"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, ImageIcon, Download, Copy, Check, RefreshCw } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "svg-to-jpeg")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Status = "idle" | "converting" | "done" | "error";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Convert 6-char hex color (#RRGGBB) to [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function SvgToJpegPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [svgText, setSvgText] = useState("");
  const [fileName, setFileName] = useState("output");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [quality, setQuality] = useState(90);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copiedB64, setCopiedB64] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef("");

  // ── helpers ───────────────────────────────────────────────────────────────

  function revokeOldUrl() {
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = "";
    }
  }

  function parseSvgDimensions(svg: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return;

    const w = parseFloat(root.getAttribute("width") || "0");
    const h = parseFloat(root.getAttribute("height") || "0");
    const vb = root.getAttribute("viewBox");

    if (w > 0 && h > 0) {
      setWidth(Math.round(w));
      setHeight(Math.round(h));
    } else if (vb) {
      const parts = vb.split(/[\s,]+/);
      if (parts.length === 4) {
        const vbW = parseFloat(parts[2]);
        const vbH = parseFloat(parts[3]);
        if (vbW > 0 && vbH > 0) {
          setWidth(Math.round(vbW));
          setHeight(Math.round(vbH));
        }
      }
    }
  }

  // ── file / text handlers ─────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".svg") && f.type !== "image/svg+xml") {
      setError("Please upload an SVG file.");
      setStatus("error");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`File too large. Maximum size is ${fmtSize(MAX_BYTES)}.`);
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setSvgText(text);
      setFileName(f.name.replace(/\.svg$/i, ""));
      parseSvgDimensions(text);
      setStatus("idle");
      setError("");
      revokeOldUrl();
      setOutputUrl("");
    };
    reader.readAsText(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  // ── conversion ────────────────────────────────────────────────────────────

  const convert = useCallback(() => {
    const svg = svgText.trim();
    if (!svg) {
      setError("Paste SVG code or upload an SVG file first.");
      setStatus("error");
      return;
    }
    if (width < 1 || height < 1 || width > 8000 || height > 8000) {
      setError("Width and height must be between 1 and 8000 px.");
      setStatus("error");
      return;
    }

    setStatus("converting");
    setError("");

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, "image/svg+xml");
      const parseError = doc.querySelector("parsererror");
      if (parseError) throw new Error("Invalid SVG: " + parseError.textContent?.slice(0, 120));

      const root = doc.querySelector("svg")!;
      root.setAttribute("width", String(width));
      root.setAttribute("height", String(height));
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(root);

      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;

        // JPEG has no transparency — fill background first
        const [r, g, b] = hexToRgb(bgColor);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(
          (jpegBlob) => {
            if (!jpegBlob) {
              setError("Conversion failed. Try a different SVG.");
              setStatus("error");
              return;
            }
            revokeOldUrl();
            const url = URL.createObjectURL(jpegBlob);
            currentBlobUrl.current = url;
            setOutputUrl(url);
            setOutputSize(jpegBlob.size);
            setStatus("done");
          },
          "image/jpeg",
          quality / 100
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        setError("Failed to render SVG. Make sure it is valid SVG markup.");
        setStatus("error");
      };
      img.src = svgUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
      setStatus("error");
    }
  }, [svgText, width, height, quality, bgColor]);

  // ── download / copy ──────────────────────────────────────────────────────

  function handleDownload() {
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${fileName}.jpg`;
    a.click();
  }

  async function handleCopyBase64() {
    const res = await fetch(outputUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = async () => {
      await navigator.clipboard.writeText(reader.result as string);
      setCopiedB64(true);
      setTimeout(() => setCopiedB64(false), 2000);
    };
    reader.readAsDataURL(blob);
  }

  function handleReset() {
    setSvgText("");
    setFileName("output");
    setOutputUrl("");
    setOutputSize(0);
    setStatus("idle");
    setError("");
    revokeOldUrl();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <ToolLayout
      tool={tool}
      relatedTools={getRelatedTools(tool)}
      howToSteps={[
        "Upload an SVG file or paste SVG code into the text area",
        "Set output dimensions, JPEG quality, and background color, then click Convert",
        "Preview the result and download your JPEG file",
      ]}
    >
      <div className="space-y-4">

        {/* Upload zone */}
        {!svgText && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop an SVG file here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">SVG only — max 10 MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* SVG text area */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            SVG Code {svgText ? <span className="text-green-500 dark:text-green-400">✓ loaded</span> : "(or paste here)"}
          </label>
          <textarea
            value={svgText}
            onChange={(e) => { setSvgText(e.target.value); setOutputUrl(""); revokeOldUrl(); }}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
            rows={svgText ? 4 : 5}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Controls grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Width (px)</label>
            <input
              type="number" value={width} min={1} max={8000}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Height (px)</label>
            <input
              type="number" value={height} min={1} max={8000}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Quality: {quality}%
            </label>
            <input
              type="range" value={quality} min={10} max={100} step={5}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color" value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-border bg-card p-0.5"
              />
              <span className="font-mono text-xs text-muted-foreground">{bgColor}</span>
            </div>
          </div>
        </div>

        <button
          onClick={convert}
          disabled={status === "converting" || !svgText.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {status === "converting" ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Converting…</>
          ) : (
            "Convert to JPEG"
          )}
        </button>

        {/* Error */}
        {status === "error" && error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Output preview */}
        {status === "done" && outputUrl && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            {/* Preview — solid bg (JPEG has no transparency) */}
            <div className="flex items-center justify-center overflow-hidden rounded-lg" style={{ background: bgColor, minHeight: 120 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outputUrl} alt="JPEG output" className="max-h-64 max-w-full object-contain" />
            </div>

            {/* Info bar + actions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                JPEG · {width} × {height} px · {quality}% quality · {fmtSize(outputSize)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyBase64}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  {copiedB64 ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy as Base64</>}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Download className="h-3.5 w-3.5" /> Download JPEG
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
