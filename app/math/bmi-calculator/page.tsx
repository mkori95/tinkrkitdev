"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "bmi-calculator")!;

const BMI_CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "text-blue-500", bg: "bg-blue-500" },
  { max: 25, label: "Normal weight", color: "text-green-500", bg: "bg-green-500" },
  { max: 30, label: "Overweight", color: "text-yellow-500", bg: "bg-yellow-500" },
  { max: Infinity, label: "Obese", color: "text-red-500", bg: "bg-red-500" },
];

function getBMICategory(bmi: number) {
  return BMI_CATEGORIES.find((c) => bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

function calcBMI(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM);
}

function healthyWeightRange(heightM: number): { min: number; max: number } {
  return {
    min: 18.5 * heightM * heightM,
    max: 24.9 * heightM * heightM,
  };
}

export default function BMICalculatorPage() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  // Metric
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // Imperial
  const [weightLb, setWeightLb] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => {
    if (unit === "metric") {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm) / 100;
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        setBmi(calcBMI(w, h));
      } else {
        setBmi(null);
      }
    } else {
      const w = parseFloat(weightLb) * 0.453592;
      const ft = parseFloat(heightFt) || 0;
      const ins = parseFloat(heightIn) || 0;
      const h = (ft * 12 + ins) * 0.0254;
      if (!isNaN(w) && h > 0 && w > 0) {
        setBmi(calcBMI(w, h));
      } else {
        setBmi(null);
      }
    }
  }, [unit, weightKg, heightCm, weightLb, heightFt, heightIn]);

  function handleClear() {
    setWeightKg(""); setHeightCm("");
    setWeightLb(""); setHeightFt(""); setHeightIn("");
    setBmi(null);
  }

  const category = bmi !== null ? getBMICategory(bmi) : null;

  // BMI scale: 15–40
  const pct = bmi !== null
    ? Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100)
    : null;

  // Healthy weight range
  let hwRange: { min: number; max: number } | null = null;
  if (unit === "metric") {
    const h = parseFloat(heightCm) / 100;
    if (!isNaN(h) && h > 0) hwRange = healthyWeightRange(h);
  } else {
    const ft = parseFloat(heightFt) || 0;
    const ins = parseFloat(heightIn) || 0;
    const h = (ft * 12 + ins) * 0.0254;
    if (h > 0) hwRange = healthyWeightRange(h);
  }

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const labelClass = "text-sm font-medium";

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Unit toggle */}
        <div className="flex gap-2">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                unit === u
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          {unit === "metric" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 70"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Weight (lb)</label>
                <input
                  type="number"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  placeholder="e.g. 154"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Height (ft)</label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Height (in)</label>
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="e.g. 9"
                  min="0"
                  max="11"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {bmi !== null && category && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-5">
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-primary">{bmi.toFixed(2)}</p>
              <p className={cn("text-lg font-semibold mb-0.5", category.color)}>{category.label}</p>
            </div>

            {/* BMI scale bar */}
            <div className="space-y-2">
              <div className="relative h-4 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-60% via-yellow-400 to-red-500">
                {pct !== null && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-foreground shadow"
                    style={{ left: `${pct}%` }}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* BMI reference table */}
            <div className="rounded-lg border border-border divide-y divide-border/50 overflow-hidden">
              {[
                { range: "< 18.5", label: "Underweight", color: "text-blue-500" },
                { range: "18.5 – 24.9", label: "Normal weight", color: "text-green-500" },
                { range: "25 – 29.9", label: "Overweight", color: "text-yellow-500" },
                { range: "≥ 30", label: "Obese", color: "text-red-500" },
              ].map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm",
                    row.label === category.label ? "bg-muted/60" : ""
                  )}
                >
                  <span className="font-mono">{row.range}</span>
                  <span className={cn("font-medium", row.color)}>{row.label}</span>
                </div>
              ))}
            </div>

            {/* Healthy weight range */}
            {hwRange && (
              <p className="text-sm text-muted-foreground">
                Healthy weight for your height:{" "}
                <strong>
                  {unit === "metric"
                    ? `${hwRange.min.toFixed(1)} – ${hwRange.max.toFixed(1)} kg`
                    : `${(hwRange.min / 0.453592).toFixed(1)} – ${(hwRange.max / 0.453592).toFixed(1)} lb`}
                </strong>
              </p>
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
