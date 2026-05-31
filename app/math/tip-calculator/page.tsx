"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { cn } from "@/lib/utils";
import { Users, DollarSign } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "tip-calculator")!;

const PRESET_TIPS = [10, 15, 18, 20, 25];

interface TipResult {
  tipAmt: number;
  total: number;
  perPerson: number;
  roundedPer: number;
  totalRounded: number;
}

function calcTip(bill: number, tipPct: number, people: number): TipResult {
  const tipAmt = (bill * tipPct) / 100;
  const total = bill + tipAmt;
  const perPerson = total / people;
  const roundedPer = Math.ceil(perPerson * 10) / 10;
  return { tipAmt, total, perPerson, roundedPer, totalRounded: roundedPer * people };
}

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TipCalculatorPage() {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(20);
  const [customTip, setCustomTip] = useState("20");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<TipResult | null>(null);

  useEffect(() => {
    const b = parseFloat(bill);
    const t = parseFloat(customTip);
    const p = parseInt(people);
    if (!isNaN(b) && b > 0 && !isNaN(t) && t >= 0 && !isNaN(p) && p >= 1) {
      setResult(calcTip(b, t, p));
    } else {
      setResult(null);
    }
  }, [bill, customTip, people]);

  function handlePreset(pct: number) {
    setTipPct(pct);
    setCustomTip(String(pct));
  }

  function handleCustomChange(val: string) {
    setCustomTip(val);
    const n = parseFloat(val);
    if (!isNaN(n)) setTipPct(n);
    else setTipPct(-1);
  }

  function handlePeopleChange(val: string) {
    const n = parseInt(val);
    if (val === "") { setPeople(""); return; }
    if (!isNaN(n) && n >= 1) setPeople(String(n));
  }

  function handleClear() {
    setBill("");
    setTipPct(20);
    setCustomTip("20");
    setPeople("1");
    setResult(null);
  }

  const numPeople = parseInt(people) || 1;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Inputs */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          {/* Bill amount */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bill Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Tip percentage */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tip Percentage</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TIPS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => handlePreset(pct)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm border transition-colors",
                    tipPct === pct
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {pct}%
                </button>
              ))}
              <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Custom"
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Number of people */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Split between
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePeopleChange(String(Math.max(1, (parseInt(people) || 1) - 1)))}
                className="rounded-lg border border-border px-3 py-2 text-lg hover:bg-accent transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={people}
                onChange={(e) => handlePeopleChange(e.target.value)}
                min="1"
                className="w-20 rounded-lg border border-border bg-card px-3 py-2.5 text-center text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                onClick={() => handlePeopleChange(String((parseInt(people) || 1) + 1))}
                className="rounded-lg border border-border px-3 py-2 text-lg hover:bg-accent transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">{numPeople === 1 ? "person" : "people"}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Main results */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Tip Amount</p>
                <p className="text-2xl font-bold text-primary">${fmtMoney(result.tipAmt)}</p>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total with Tip</p>
                <p className="text-2xl font-bold text-primary">${fmtMoney(result.total)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {numPeople > 1 ? `Per Person (${numPeople})` : "Total"}
                </p>
                <p className="text-2xl font-bold">${fmtMoney(result.perPerson)}</p>
              </div>
            </div>

            {/* Round up suggestion */}
            {numPeople > 1 && result.roundedPer !== result.perPerson && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium mb-1">Round-up suggestion</p>
                <p className="text-sm text-muted-foreground">
                  Each person pays{" "}
                  <strong className="text-foreground">${fmtMoney(result.roundedPer)}</strong>
                  {" "}→ Total collected:{" "}
                  <strong className="text-foreground">${fmtMoney(result.totalRounded)}</strong>
                  {" "}(extra tip: ${fmtMoney(result.totalRounded - result.total)})
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Bill ${fmtMoney(parseFloat(bill) || 0)} + {customTip}% tip (${fmtMoney(result.tipAmt)}) = ${fmtMoney(result.total)}
              {numPeople > 1 && ` ÷ ${numPeople} people = $${fmtMoney(result.perPerson)} each`}
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
