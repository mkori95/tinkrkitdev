"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "percentage-calculator")!;

type TabId = "what-is" | "x-is-what" | "percent-change";

const TABS: { id: TabId; label: string }[] = [
  { id: "what-is", label: "What is X% of Y?" },
  { id: "x-is-what", label: "X is what % of Y?" },
  { id: "percent-change", label: "% Change" },
];

function formatResult(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(10)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function PercentageCalculatorPage() {
  const [tab, setTab] = useState<TabId>("what-is");

  // Tab 1: What is X% of Y?
  const [pct1, setPct1] = useState("");
  const [num1, setNum1] = useState("");
  const [result1, setResult1] = useState<number | null>(null);

  // Tab 2: X is what % of Y?
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");
  const [result2, setResult2] = useState<number | null>(null);

  // Tab 3: Percent change from X to Y
  const [from3, setFrom3] = useState("");
  const [to3, setTo3] = useState("");
  const [result3, setResult3] = useState<number | null>(null);

  useEffect(() => {
    const p = parseFloat(pct1);
    const n = parseFloat(num1);
    if (!isNaN(p) && !isNaN(n)) {
      setResult1((n * p) / 100);
    } else {
      setResult1(null);
    }
  }, [pct1, num1]);

  useEffect(() => {
    const x = parseFloat(x2);
    const y = parseFloat(y2);
    if (!isNaN(x) && !isNaN(y) && y !== 0) {
      setResult2((x / y) * 100);
    } else {
      setResult2(null);
    }
  }, [x2, y2]);

  useEffect(() => {
    const f = parseFloat(from3);
    const t = parseFloat(to3);
    if (!isNaN(f) && !isNaN(t) && f !== 0) {
      setResult3(((t - f) / Math.abs(f)) * 100);
    } else {
      setResult3(null);
    }
  }, [from3, to3]);

  function handleClear() {
    setPct1(""); setNum1(""); setResult1(null);
    setX2(""); setY2(""); setResult2(null);
    setFrom3(""); setTo3(""); setResult3(null);
  }

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const labelClass = "text-sm font-medium";

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1 */}
        {tab === "what-is" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                What is <strong>X%</strong> of <strong>Y</strong>?
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>X (percent)</label>
                  <input
                    type="number"
                    value={pct1}
                    onChange={(e) => setPct1(e.target.value)}
                    placeholder="e.g. 20"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Y (number)</label>
                  <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="e.g. 500"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            {result1 !== null && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <p className="text-sm text-muted-foreground mb-1">
                  {pct1}% of {num1} =
                </p>
                <p className="text-3xl font-bold text-primary">{formatResult(result1)}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2 */}
        {tab === "x-is-what" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>X</strong> is what percent of <strong>Y</strong>?
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>X</label>
                  <input
                    type="number"
                    value={x2}
                    onChange={(e) => setX2(e.target.value)}
                    placeholder="e.g. 50"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Y</label>
                  <input
                    type="number"
                    value={y2}
                    onChange={(e) => setY2(e.target.value)}
                    placeholder="e.g. 200"
                    className={inputClass}
                  />
                </div>
              </div>
              {parseFloat(y2) === 0 && y2 !== "" && (
                <p className="text-xs text-destructive">Y cannot be zero</p>
              )}
            </div>
            {result2 !== null && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <p className="text-sm text-muted-foreground mb-1">
                  {x2} is what % of {y2}?
                </p>
                <p className="text-3xl font-bold text-primary">{formatResult(result2)}%</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3 */}
        {tab === "percent-change" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Percentage change from <strong>X</strong> to <strong>Y</strong>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>From (X)</label>
                  <input
                    type="number"
                    value={from3}
                    onChange={(e) => setFrom3(e.target.value)}
                    placeholder="e.g. 80"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>To (Y)</label>
                  <input
                    type="number"
                    value={to3}
                    onChange={(e) => setTo3(e.target.value)}
                    placeholder="e.g. 100"
                    className={inputClass}
                  />
                </div>
              </div>
              {parseFloat(from3) === 0 && from3 !== "" && (
                <p className="text-xs text-destructive">From value cannot be zero</p>
              )}
            </div>
            {result3 !== null && (
              <div className={cn(
                "rounded-xl border p-5",
                result3 >= 0
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              )}>
                <p className={cn("text-sm mb-1", result3 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {result3 >= 0 ? "Increase" : "Decrease"} from {from3} to {to3}
                </p>
                <p className={cn("text-3xl font-bold", result3 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {result3 >= 0 ? "+" : ""}{formatResult(result3)}%
                </p>
              </div>
            )}
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
