"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "file-size-converter")!;

type Unit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";

const UNITS: Unit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

const UNIT_LABELS: Record<Unit, string> = {
  B: "Bytes",
  KB: "Kilobytes",
  MB: "Megabytes",
  GB: "Gigabytes",
  TB: "Terabytes",
  PB: "Petabytes",
};

const BYTES_PER: Record<Unit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      disabled={!value}
      title="Copy value"
      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function formatResult(value: number): string {
  if (!isFinite(value)) return "";
  if (value === 0) return "0";
  if (value >= 1e15) return value.toExponential(4);
  if (value >= 1) return parseFloat(value.toPrecision(10)).toString();
  return parseFloat(value.toPrecision(6)).toString();
}

export default function FileSizeConverterPage() {
  const [inputValue, setInputValue] = useState("");
  const [inputUnit, setInputUnit] = useState<Unit>("MB");

  const numericValue = parseFloat(inputValue);
  const hasValue = inputValue.trim() !== "" && !isNaN(numericValue) && numericValue >= 0;

  function convert(toUnit: Unit): string {
    if (!hasValue) return "";
    const inBytes = numericValue * BYTES_PER[inputUnit];
    const result = inBytes / BYTES_PER[toUnit];
    return formatResult(result);
  }

  function clear() {
    setInputValue("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <label className="text-sm font-medium">Enter File Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 1500"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value as Unit)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={!inputValue}
              className="shrink-0"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversions (base 2: 1 KB = 1024 B)
            </span>
          </div>
          <div className="divide-y divide-border">
            {UNITS.map((unit) => {
              const result = convert(unit);
              const isSource = unit === inputUnit;
              return (
                <div
                  key={unit}
                  className={`flex items-center gap-3 px-4 py-3 ${isSource && hasValue ? "bg-primary/5" : ""}`}
                >
                  <div className="w-10 shrink-0">
                    <span
                      className={`text-xs font-semibold ${isSource && hasValue ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {unit}
                    </span>
                  </div>
                  <div className="w-32 shrink-0 text-xs text-muted-foreground hidden sm:block">
                    {UNIT_LABELS[unit]}
                  </div>
                  <span className="flex-1 font-mono text-sm break-all">
                    {hasValue && result ? (
                      result
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </span>
                  {hasValue && result && <CopyButton value={result} />}
                </div>
              );
            })}
          </div>
        </div>

        {!hasValue && (
          <p className="text-center text-sm text-muted-foreground">
            Enter a value and select a unit to see all conversions instantly.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
