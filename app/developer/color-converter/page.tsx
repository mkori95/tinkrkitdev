"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "color-converter")!;

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clean);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

const SWATCHES = [
  "#FF0000", "#FF6600", "#FFCC00", "#33CC33",
  "#0066FF", "#6600CC", "#FF66CC", "#FFFFFF",
  "#CCCCCC", "#666666", "#333333", "#000000",
];

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [hexInput, setHexInput] = useState("#3b82f6");

  const syncFromRgb = useCallback((r: number, g: number, b: number) => {
    const newHex = rgbToHex(r, g, b);
    const newHsl = rgbToHsl(r, g, b);
    setRgb({ r, g, b });
    setHex(newHex);
    setHexInput(newHex);
    setHsl(newHsl);
  }, []);

  function handleColorPicker(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const rgbVal = hexToRgb(val);
    if (rgbVal) {
      syncFromRgb(rgbVal.r, rgbVal.g, rgbVal.b);
    }
  }

  function handleHexInput(val: string) {
    setHexInput(val);
    const clean = val.startsWith("#") ? val : "#" + val;
    const rgbVal = hexToRgb(clean);
    if (rgbVal) {
      const newHsl = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHex(clean);
      setRgb(rgbVal);
      setHsl(newHsl);
    }
  }

  function handleRgb(key: keyof RGB, val: string) {
    const num = parseInt(val) || 0;
    const newRgb = { ...rgb, [key]: Math.max(0, Math.min(255, num)) };
    syncFromRgb(newRgb.r, newRgb.g, newRgb.b);
  }

  function handleHsl(key: keyof HSL, val: string) {
    const num = parseInt(val) || 0;
    const max = key === "h" ? 360 : 100;
    const newHsl = { ...hsl, [key]: Math.max(0, Math.min(max, num)) };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgb(newRgb);
    setHex(newHex);
    setHexInput(newHex);
  }

  function applySwatchHex(h: string) {
    const r = hexToRgb(h);
    if (r) syncFromRgb(r.r, r.g, r.b);
  }

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-5">
        {/* Color preview */}
        <div
          className="w-full h-32 rounded-xl border border-border shadow-inner transition-colors duration-150"
          style={{ backgroundColor: hex }}
        />

        {/* Picker + HEX row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Color Picker</label>
            <input
              type="color"
              value={hex}
              onChange={handleColorPicker}
              className="h-9 w-14 cursor-pointer rounded-lg border border-border bg-card p-0.5"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">HEX</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#3b82f6"
              className="w-28 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* RGB */}
          {(["r", "g", "b"] as const).map((ch) => (
            <div key={ch} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{ch.toUpperCase()}</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => handleRgb(ch, e.target.value)}
                className="w-16 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          ))}

          {/* HSL */}
          {(["h", "s", "l"] as const).map((ch) => (
            <div key={ch} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                {ch.toUpperCase()}{ch !== "h" ? "%" : "°"}
              </label>
              <input
                type="number"
                min={0}
                max={ch === "h" ? 360 : 100}
                value={hsl[ch]}
                onChange={(e) => handleHsl(ch, e.target.value)}
                className="w-16 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Copy buttons */}
        <div className="flex flex-wrap gap-2">
          <CopyButton value={hexStr} label={`Copy HEX: ${hexStr}`} />
          <CopyButton value={rgbStr} label={`Copy RGB: ${rgbStr}`} />
          <CopyButton value={hslStr} label={`Copy HSL: ${hslStr}`} />
        </div>

        {/* Color swatches */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Swatches</label>
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((s) => (
              <button
                key={s}
                onClick={() => applySwatchHex(s)}
                title={s}
                className="h-8 w-8 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: s,
                  borderColor: hex.toLowerCase() === s.toLowerCase() ? "var(--foreground)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Values display */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Values</span>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: "HEX", value: hexStr },
              { label: "RGB", value: rgbStr },
              { label: "HSL", value: hslStr },
              { label: "CSS Variable", value: `--color: ${hexStr};` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
                <span className="flex-1 font-mono text-sm">{value}</span>
                <CopyButton value={value} label="Copy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
