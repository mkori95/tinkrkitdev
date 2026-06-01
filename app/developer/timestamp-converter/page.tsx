"use client";

import { useState, useEffect } from "react";
import { getUrlInput } from "@/lib/url-input";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, Clock } from "lucide-react";
import { AlertCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "timestamp-converter")!;

interface DateFormats {
  unix_sec: string;
  unix_ms: string;
  iso8601: string;
  utc: string;
  local: string;
  relative: string;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  if (abs < 5000) return "just now";
  if (abs < 60000) {
    const s = Math.round(abs / 1000);
    return diff > 0 ? `${s} seconds ago` : `in ${s} seconds`;
  }
  if (abs < 3600000) {
    const m = Math.round(abs / 60000);
    return diff > 0 ? `${m} minute${m > 1 ? "s" : ""} ago` : `in ${m} minute${m > 1 ? "s" : ""}`;
  }
  if (abs < 86400000) {
    const h = Math.round(abs / 3600000);
    return diff > 0 ? `${h} hour${h > 1 ? "s" : ""} ago` : `in ${h} hour${h > 1 ? "s" : ""}`;
  }
  const d = Math.round(abs / 86400000);
  return diff > 0 ? `${d} day${d > 1 ? "s" : ""} ago` : `in ${d} day${d > 1 ? "s" : ""}`;
}

function formatDate(date: Date): DateFormats {
  return {
    unix_sec: Math.floor(date.getTime() / 1000).toString(),
    unix_ms: date.getTime().toString(),
    iso8601: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: relativeTime(date),
  };
}

function CopyCell({ value }: { value: string }) {
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

const FORMAT_ROWS = [
  { key: "unix_sec" as const, label: "Unix (seconds)" },
  { key: "unix_ms" as const, label: "Unix (milliseconds)" },
  { key: "iso8601" as const, label: "ISO 8601" },
  { key: "utc" as const, label: "UTC String" },
  { key: "local" as const, label: "Local Date/Time" },
  { key: "relative" as const, label: "Relative" },
];

export default function TimestampConverterPage() {
  // Section 1: Timestamp → Date — pre-populate from ?input= (extension)
  const [tsInput, setTsInput] = useState<string>(() => getUrlInput());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tsInput) convertTs(); }, []);
  const [tsResult, setTsResult] = useState<DateFormats | null>(null);
  const [tsError, setTsError] = useState("");

  // Section 2: Date → Timestamp
  const [dateInput, setDateInput] = useState("");
  const [dateResult, setDateResult] = useState<DateFormats | null>(null);
  const [dateError, setDateError] = useState("");

  function convertTs() {
    if (!tsInput.trim()) return;
    try {
      const num = parseFloat(tsInput.trim());
      if (isNaN(num)) throw new Error("Not a number");
      // auto-detect seconds vs milliseconds
      const ms = num > 1e12 ? num : num * 1000;
      const date = new Date(ms);
      if (isNaN(date.getTime())) throw new Error("Invalid timestamp");
      setTsResult(formatDate(date));
      setTsError("");
    } catch {
      setTsError("Invalid timestamp. Enter Unix seconds (e.g. 1716912000) or milliseconds (e.g. 1716912000000).");
      setTsResult(null);
    }
  }

  function convertDate() {
    if (!dateInput.trim()) return;
    try {
      const date = new Date(dateInput.trim());
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      setDateResult(formatDate(date));
      setDateError("");
    } catch {
      setDateError("Invalid date string. Try ISO 8601, e.g. 2024-05-28 or 2024-05-28T10:30:00Z.");
      setDateResult(null);
    }
  }

  function useNow() {
    const now = Date.now();
    setTsInput(Math.floor(now / 1000).toString());
    const date = new Date(now);
    setTsResult(formatDate(date));
    setTsError("");
  }

  function ResultTable({ result }: { result: DateFormats }) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {FORMAT_ROWS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-44 shrink-0 text-xs text-muted-foreground">{label}</span>
              <span className="flex-1 font-mono text-sm text-foreground">{result[key]}</span>
              <CopyCell value={result[key]} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-8">
        {/* Section 1: Timestamp to Date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Timestamp to Date</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="1716912000 or 1716912000000"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <Button onClick={convertTs} disabled={!tsInput.trim()}>
              Convert
            </Button>
            <Button variant="outline" onClick={useNow} className="gap-1.5 shrink-0">
              <Clock className="h-4 w-4" />
              Now
            </Button>
          </div>

          {tsError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {tsError}
            </div>
          )}

          {tsResult && <ResultTable result={tsResult} />}
        </div>

        <div className="border-t border-border" />

        {/* Section 2: Date to Timestamp */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Date to Timestamp</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="2024-05-28T10:30:00Z or May 28 2024"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <Button onClick={convertDate} disabled={!dateInput.trim()}>
              Convert
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["2024-01-01", "2024-05-28T10:30:00Z", new Date().toISOString().slice(0, 10)].map((ex) => (
              <button
                key={ex}
                onClick={() => setDateInput(ex)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors font-mono"
              >
                {ex}
              </button>
            ))}
          </div>

          {dateError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {dateError}
            </div>
          )}

          {dateResult && <ResultTable result={dateResult} />}
        </div>
      </div>
    </ToolLayout>
  );
}
