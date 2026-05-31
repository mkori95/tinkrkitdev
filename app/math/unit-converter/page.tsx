"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "unit-converter")!;

type UnitCategory = "length" | "weight" | "temperature" | "area" | "volume" | "speed" | "data";

interface UnitDef {
  name: string;
  symbol: string;
  factor?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

const UNITS: Record<UnitCategory, { label: string; units: UnitDef[] }> = {
  length: {
    label: "Length",
    units: [
      { name: "Millimeter", symbol: "mm", factor: 0.001 },
      { name: "Centimeter", symbol: "cm", factor: 0.01 },
      { name: "Meter", symbol: "m", factor: 1 },
      { name: "Kilometer", symbol: "km", factor: 1000 },
      { name: "Inch", symbol: "in", factor: 0.0254 },
      { name: "Foot", symbol: "ft", factor: 0.3048 },
      { name: "Yard", symbol: "yd", factor: 0.9144 },
      { name: "Mile", symbol: "mi", factor: 1609.344 },
      { name: "Nautical Mile", symbol: "nmi", factor: 1852 },
    ],
  },
  weight: {
    label: "Weight",
    units: [
      { name: "Milligram", symbol: "mg", factor: 0.000001 },
      { name: "Gram", symbol: "g", factor: 0.001 },
      { name: "Kilogram", symbol: "kg", factor: 1 },
      { name: "Metric Ton", symbol: "t", factor: 1000 },
      { name: "Ounce", symbol: "oz", factor: 0.0283495 },
      { name: "Pound", symbol: "lb", factor: 0.453592 },
      { name: "Stone", symbol: "st", factor: 6.35029 },
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      { name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
      { name: "Fahrenheit", symbol: "°F", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  area: {
    label: "Area",
    units: [
      { name: "Square Millimeter", symbol: "mm²", factor: 0.000001 },
      { name: "Square Centimeter", symbol: "cm²", factor: 0.0001 },
      { name: "Square Meter", symbol: "m²", factor: 1 },
      { name: "Square Kilometer", symbol: "km²", factor: 1000000 },
      { name: "Square Inch", symbol: "in²", factor: 0.00064516 },
      { name: "Square Foot", symbol: "ft²", factor: 0.092903 },
      { name: "Acre", symbol: "ac", factor: 4046.86 },
      { name: "Hectare", symbol: "ha", factor: 10000 },
    ],
  },
  volume: {
    label: "Volume",
    units: [
      { name: "Milliliter", symbol: "mL", factor: 0.001 },
      { name: "Liter", symbol: "L", factor: 1 },
      { name: "Cubic Meter", symbol: "m³", factor: 1000 },
      { name: "Teaspoon", symbol: "tsp", factor: 0.00492892 },
      { name: "Tablespoon", symbol: "tbsp", factor: 0.0147868 },
      { name: "Fluid Ounce", symbol: "fl oz", factor: 0.0295735 },
      { name: "Cup", symbol: "cup", factor: 0.236588 },
      { name: "Pint", symbol: "pt", factor: 0.473176 },
      { name: "Gallon", symbol: "gal", factor: 3.78541 },
    ],
  },
  speed: {
    label: "Speed",
    units: [
      { name: "Meters per second", symbol: "m/s", factor: 1 },
      { name: "Kilometers per hour", symbol: "km/h", factor: 0.277778 },
      { name: "Miles per hour", symbol: "mph", factor: 0.44704 },
      { name: "Knot", symbol: "kn", factor: 0.514444 },
      { name: "Feet per second", symbol: "ft/s", factor: 0.3048 },
    ],
  },
  data: {
    label: "Data Size",
    units: [
      { name: "Bit", symbol: "bit", factor: 0.125 },
      { name: "Byte", symbol: "B", factor: 1 },
      { name: "Kilobyte", symbol: "KB", factor: 1024 },
      { name: "Megabyte", symbol: "MB", factor: 1048576 },
      { name: "Gigabyte", symbol: "GB", factor: 1073741824 },
      { name: "Terabyte", symbol: "TB", factor: 1099511627776 },
    ],
  },
};

function convertValue(value: number, fromUnit: UnitDef, toUnit: UnitDef, category: UnitCategory): number {
  if (category === "temperature") {
    const celsius = fromUnit.toBase!(value);
    return toUnit.fromBase!(celsius);
  }
  const inBase = value * fromUnit.factor!;
  return inBase / toUnit.factor!;
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(4);
  return parseFloat(n.toPrecision(8)).toString();
}

const CATEGORY_KEYS = Object.keys(UNITS) as UnitCategory[];

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [inputValue, setInputValue] = useState("1");
  const [fromSymbol, setFromSymbol] = useState("m");
  const [toSymbol, setToSymbol] = useState("ft");

  const currentUnits = UNITS[category].units;

  useEffect(() => {
    const first = currentUnits[0].symbol;
    const second = currentUnits[1]?.symbol ?? first;
    setFromSymbol(first);
    setToSymbol(second);
  }, [category, currentUnits]);

  const fromUnit = currentUnits.find((u) => u.symbol === fromSymbol) ?? currentUnits[0];
  const toUnit = currentUnits.find((u) => u.symbol === toSymbol) ?? currentUnits[1] ?? currentUnits[0];

  const numVal = parseFloat(inputValue);
  const result = isNaN(numVal) ? null : convertValue(numVal, fromUnit, toUnit, category);

  function handleSwap() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  function handleClear() {
    setInputValue("1");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {UNITS[cat].label}
            </button>
          ))}
        </div>

        {/* Conversion inputs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Value + From */}
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">Value</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">From</label>
              <select
                value={fromSymbol}
                onChange={(e) => setFromSymbol(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {currentUnits.map((u) => (
                  <option key={u.symbol} value={u.symbol}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <button
              onClick={handleSwap}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-accent transition-colors self-end"
              title="Swap units"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">To</label>
              <select
                value={toSymbol}
                onChange={(e) => setToSymbol(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {currentUnits.map((u) => (
                  <option key={u.symbol} value={u.symbol}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground mb-1">Result</p>
            <p className="text-3xl font-bold text-primary">
              {formatNumber(result)} <span className="text-xl">{toUnit.symbol}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {inputValue} {fromUnit.symbol} = {formatNumber(result)} {toUnit.symbol}
            </p>
          </div>
        )}

        {/* All conversions table */}
        {result !== null && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">All {UNITS[category].label} Conversions</h3>
            <div className="divide-y divide-border/50">
              {currentUnits.map((unit) => {
                const val = convertValue(numVal, fromUnit, unit, category);
                return (
                  <div key={unit.symbol} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">
                      {unit.name} ({unit.symbol})
                    </span>
                    <span className="font-mono font-medium text-sm">{formatNumber(val)}</span>
                  </div>
                );
              })}
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
