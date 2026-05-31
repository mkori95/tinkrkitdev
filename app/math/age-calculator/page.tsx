"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Calendar, Clock, Star } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "age-calculator")!;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  weeks: number;
  daysToNextBirthday: number;
  nextBirthday: Date;
  bornOnDay: string;
}

function calcAge(dob: Date, asOf: Date): AgeResult {
  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

  const nextBirthday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= asOf) nextBirthday.setFullYear(asOf.getFullYear() + 1);
  const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));

  const bornOnDay = DAY_NAMES[dob.getDay()];

  return { years, months, days, totalDays, weeks: Math.floor(totalDays / 7), daysToNextBirthday, nextBirthday, bornOnDay };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(todayStr());
  const [result, setResult] = useState<AgeResult | null>(null);

  useEffect(() => {
    if (!dob || !asOf) { setResult(null); return; }
    const dobDate = new Date(dob + "T00:00:00");
    const asOfDate = new Date(asOf + "T00:00:00");
    if (isNaN(dobDate.getTime()) || isNaN(asOfDate.getTime())) { setResult(null); return; }
    if (dobDate > asOfDate) { setResult(null); return; }
    setResult(calcAge(dobDate, asOfDate));
  }, [dob, asOf]);

  function handleClear() {
    setDob("");
    setAsOf(todayStr());
    setResult(null);
  }

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const labelClass = "text-sm font-medium";

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-6">
        {/* Date inputs */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={asOf}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Age as of</label>
              <input
                type="date"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {dob && asOf && new Date(dob + "T00:00:00") > new Date(asOf + "T00:00:00") && (
            <p className="text-xs text-destructive">Date of birth cannot be after the &quot;as of&quot; date.</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Main age display */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground mb-2">Age</p>
              <p className="text-4xl font-bold text-primary">
                {result.years} <span className="text-2xl">years</span>
              </p>
              <p className="mt-1 text-lg text-foreground">
                {result.months} months, {result.days} days
              </p>
            </div>

            {/* Stat grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Total days lived</p>
                  <p className="text-xl font-bold">{result.totalDays.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{result.weeks.toLocaleString()} weeks</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                <Star className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Next birthday</p>
                  <p className="text-xl font-bold">
                    {result.daysToNextBirthday === 0 ? "Today! 🎂" : `In ${result.daysToNextBirthday} days`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(result.nextBirthday)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 sm:col-span-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Born on a</p>
                  <p className="text-xl font-bold">{result.bornOnDay}</p>
                </div>
              </div>
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
