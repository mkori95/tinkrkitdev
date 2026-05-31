"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "base-converter")!;

const BASES = [
  { label: "Binary", base: 2, prefix: "0b", example: "1010" },
  { label: "Octal", base: 8, prefix: "0o", example: "12" },
  { label: "Decimal", base: 10, prefix: "", example: "10" },
  { label: "Hexadecimal", base: 16, prefix: "0x", example: "A" },
] as const;

type BaseNum = 2 | 8 | 10 | 16;

interface ConvertResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

function convert(value: string, fromBase: BaseNum): ConvertResult | null {
  if (!value.trim()) return null;
  const decimal = parseInt(value.replace(/^0[bBxXoO]/, ""), fromBase);
  if (isNaN(decimal) || decimal < 0) return null;
  return {
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
  };
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const EXAMPLES: { from: BaseNum; value: string; label: string }[] = [
  { from: 10, value: "255", label: "255 (decimal)" },
  { from: 2, value: "11111111", label: "11111111 (binary)" },
  { from: 16, value: "FF", label: "FF (hex)" },
  { from: 10, value: "42", label: "42 (decimal)" },
];

export default function BaseConverterPage() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<BaseNum>(10);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState("");

  function handleConvert(value: string, base: BaseNum) {
    if (!value.trim()) {
      setResult(null);
      setError("");
      return;
    }
    const r = convert(value, base);
    if (r) {
      setResult(r);
      setError("");
    } else {
      setResult(null);
      setError(`"${value}" is not a valid ${BASES.find(b => b.base === base)?.label.toLowerCase()} number.`);
    }
  }

  function handleInput(val: string) {
    setInput(val);
    handleConvert(val, fromBase);
  }

  function handleBase(base: BaseNum) {
    setFromBase(base);
    handleConvert(input, base);
  }

  function loadExample(ex: typeof EXAMPLES[0]) {
    setInput(ex.value);
    setFromBase(ex.from);
    handleConvert(ex.value, ex.from);
  }

  function clear() {
    setInput("");
    setResult(null);
    setError("");
  }

  const outputRows = [
    { key: "binary" as const, label: "Binary", base: 2, prefix: "0b" },
    { key: "octal" as const, label: "Octal", base: 8, prefix: "0o" },
    { key: "decimal" as const, label: "Decimal", base: 10, prefix: "" },
    { key: "hex" as const, label: "Hexadecimal", base: 16, prefix: "0x" },
  ];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-5">
        {/* Input + base selector */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Input Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={BASES.find(b => b.base === fromBase)?.example ?? ""}
              className={cn(
                "flex-1 rounded-lg border bg-card px-3 py-2 font-mono text-sm outline-none",
                "placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                error ? "border-destructive/60" : "border-border"
              )}
              spellCheck={false}
            />
            <Button variant="ghost" size="sm" onClick={clear} disabled={!input}>
              Clear
            </Button>
          </div>

          {/* Base selector */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">Input base:</span>
            {BASES.map(({ label, base }) => (
              <button
                key={base}
                onClick={() => handleBase(base)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  fromBase === base
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {label} ({base})
              </button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={`${ex.from}-${ex.value}`}
              onClick={() => loadExample(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors font-mono"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Results table */}
        {result && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/60 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversions</span>
            </div>
            <div className="divide-y divide-border">
              {outputRows.map(({ key, label, base, prefix }) => {
                const val = result[key];
                const displayVal = prefix + val;
                const isSource = base === fromBase;
                return (
                  <div key={key} className={cn("flex items-center gap-4 px-4 py-3", isSource && "bg-primary/5")}>
                    <div className="w-32 shrink-0">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">(base {base})</span>
                      {isSource && (
                        <span className="ml-1.5 text-xs text-primary font-medium">← input</span>
                      )}
                    </div>
                    <span className="flex-1 font-mono text-sm font-medium">{displayVal}</span>
                    <CopyButton value={displayVal} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!result && !error && !input && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to use</p>
            <p>Enter a number and select its current base. All conversions will update live.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
