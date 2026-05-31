"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "number-converter")!;

const BASES = [
  { label: "Decimal", base: 10, prefix: "", placeholder: "e.g. 255", validChars: /^-?[0-9]*$/ },
  { label: "Binary", base: 2, prefix: "0b", placeholder: "e.g. 11111111", validChars: /^-?[01]*$/ },
  { label: "Octal", base: 8, prefix: "0o", placeholder: "e.g. 377", validChars: /^-?[0-7]*$/ },
  { label: "Hexadecimal", base: 16, prefix: "0x", placeholder: "e.g. FF", validChars: /^-?[0-9a-fA-F]*$/ },
];

function toDecimal(val: string, base: number): number | null {
  if (!val || val === "-") return null;
  const neg = val.startsWith("-");
  const abs = neg ? val.slice(1) : val;
  if (!abs) return null;
  const n = parseInt(abs, base);
  if (isNaN(n)) return null;
  return neg ? -n : n;
}

function fromDecimal(n: number, base: number): string {
  if (isNaN(n)) return "";
  const neg = n < 0;
  const abs = Math.abs(n).toString(base).toUpperCase();
  return neg ? "-" + abs : abs;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function NumberConverterPage() {
  const [values, setValues] = useState<string[]>(["255", "11111111", "377", "FF"]);
  const [errors, setErrors] = useState<boolean[]>([false, false, false, false]);
  const [showTable, setShowTable] = useState(false);

  function handleChange(idx: number, raw: string) {
    const { validChars, base } = BASES[idx];
    if (raw !== "" && !validChars.test(raw)) return; // reject invalid chars

    const newValues = [...values];
    const newErrors = [...errors];
    newValues[idx] = raw;
    newErrors[idx] = false;

    const decimal = toDecimal(raw, base);
    if (decimal !== null) {
      BASES.forEach((b, i) => {
        if (i !== idx) {
          newValues[i] = fromDecimal(decimal, b.base);
          newErrors[i] = false;
        }
      });
    } else if (raw === "" || raw === "-") {
      BASES.forEach((_, i) => {
        if (i !== idx) newValues[i] = "";
      });
    } else {
      newErrors[idx] = true;
    }

    setValues(newValues);
    setErrors(newErrors);
  }

  function handleClear() {
    setValues(["", "", "", ""]);
    setErrors([false, false, false, false]);
  }

  const decimalVal = toDecimal(values[0], 10);
  const tableRows = decimalVal !== null
    ? Array.from({ length: 256 }, (_, i) => i)
    : [];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Input fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          {BASES.map((b, idx) => (
            <div key={b.label} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{b.label}</label>
                {b.prefix && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    {b.prefix}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={values[idx]}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  placeholder={b.placeholder}
                  className={`w-full rounded-lg border bg-card px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:border-primary transition-colors ${
                    errors[idx]
                      ? "border-destructive focus:ring-destructive/30"
                      : "border-border focus:ring-primary/30"
                  }`}
                />
                {values[idx] && !errors[idx] && (
                  <CopyButton text={values[idx]} />
                )}
              </div>
              {errors[idx] && (
                <p className="text-xs text-destructive">Invalid {b.label.toLowerCase()} value</p>
              )}
            </div>
          ))}
        </div>

        {/* Info cards */}
        {decimalVal !== null && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground mb-1">Decimal value</p>
            <p className="text-3xl font-bold text-primary">{decimalVal.toLocaleString()}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
              {BASES.map((b, idx) => (
                <div key={b.label}>
                  <span className="text-muted-foreground">{b.label}</span>
                  <p className="font-mono font-medium break-all">{values[idx] || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion table toggle */}
        <div>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {showTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showTable ? "Hide" : "Show"} 0–255 conversion table
          </button>
        </div>

        {showTable && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Decimal</th>
                    <th className="px-3 py-2 text-left font-medium">Binary</th>
                    <th className="px-3 py-2 text-left font-medium">Octal</th>
                    <th className="px-3 py-2 text-left font-medium">Hexadecimal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tableRows.map((n) => (
                    <tr key={n} className="hover:bg-muted/40">
                      <td className="px-3 py-1.5 font-mono">{n}</td>
                      <td className="px-3 py-1.5 font-mono">{n.toString(2)}</td>
                      <td className="px-3 py-1.5 font-mono">{n.toString(8)}</td>
                      <td className="px-3 py-1.5 font-mono uppercase">{n.toString(16)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
