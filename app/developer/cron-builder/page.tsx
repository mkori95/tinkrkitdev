"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, Copy, Check } from "lucide-react";
import cronstrue from "cronstrue";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "cron-builder")!;

const PRESETS = [
  { label: "@hourly", expr: "0 * * * *", desc: "Every hour" },
  { label: "@daily", expr: "0 0 * * *", desc: "Every day at midnight" },
  { label: "@weekly", expr: "0 0 * * 0", desc: "Every Sunday at midnight" },
  { label: "@monthly", expr: "0 0 1 * *", desc: "First day of month at midnight" },
  { label: "@yearly", expr: "0 0 1 1 *", desc: "January 1st at midnight" },
  { label: "Every 5 min", expr: "*/5 * * * *", desc: "Every 5 minutes" },
  { label: "Weekdays 9am", expr: "0 9 * * 1-5", desc: "Weekdays at 9:00 AM" },
  { label: "Every 30 min", expr: "*/30 * * * *", desc: "Every 30 minutes" },
];

function describe(expr: string): string {
  try {
    return cronstrue.toString(expr);
  } catch {
    return "";
  }
}

interface VisualField {
  label: string;
  key: "minute" | "hour" | "dom" | "month" | "dow";
  placeholder: string;
  hint: string;
}

const FIELDS: VisualField[] = [
  { label: "Minute", key: "minute", placeholder: "*", hint: "0-59 or * or */5" },
  { label: "Hour", key: "hour", placeholder: "*", hint: "0-23 or * or */2" },
  { label: "Day of Month", key: "dom", placeholder: "*", hint: "1-31 or *" },
  { label: "Month", key: "month", placeholder: "*", hint: "1-12 or JAN-DEC or *" },
  { label: "Day of Week", key: "dow", placeholder: "*", hint: "0-6 or SUN-SAT or *" },
];

export default function CronBuilderPage() {
  const [expr, setExpr] = useState("* * * * *");
  const [visual, setVisual] = useState({ minute: "*", hour: "*", dom: "*", month: "*", dow: "*" });
  const [copied, setCopied] = useState(false);

  const description = describe(expr);
  const isValid = description !== "";
  const error = !isValid && expr.trim() !== "" ? "Invalid cron expression" : "";

  function updateVisualField(key: VisualField["key"], value: string) {
    const next = { ...visual, [key]: value || "*" };
    setVisual(next);
    setExpr(`${next.minute} ${next.hour} ${next.dom} ${next.month} ${next.dow}`);
  }

  function applyPreset(e: string) {
    setExpr(e);
    const parts = e.split(" ");
    if (parts.length === 5) {
      setVisual({ minute: parts[0], hour: parts[1], dom: parts[2], month: parts[3], dow: parts[4] });
    }
  }

  function syncFromExpr(e: string) {
    setExpr(e);
    const parts = e.split(" ");
    if (parts.length === 5) {
      setVisual({ minute: parts[0], hour: parts[1], dom: parts[2], month: parts[3], dow: parts[4] });
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-5">
        {/* Direct expression input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Cron Expression</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expr}
              onChange={(e) => syncFromExpr(e.target.value)}
              placeholder="* * * * *"
              className={cn(
                "flex-1 rounded-lg border bg-card px-3 py-2 font-mono text-sm outline-none",
                "placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                error ? "border-destructive/60" : "border-border"
              )}
              spellCheck={false}
            />
            <Button variant="outline" size="sm" onClick={copy} className="gap-1.5 shrink-0">
              {copied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Format: minute hour day-of-month month day-of-week</p>
        </div>

        {/* Human-readable description */}
        {isValid ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">{description}</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {/* Visual builder */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Builder</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {FIELDS.map(({ label, key, placeholder, hint }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">{label}</label>
                <input
                  type="text"
                  value={visual[key]}
                  onChange={(e) => updateVisualField(key, e.target.value)}
                  placeholder={placeholder}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <span className="text-xs text-muted-foreground">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Common Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(({ label, expr: e, desc }) => (
              <button
                key={e}
                onClick={() => applyPreset(e)}
                title={desc}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  expr === e
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick reference */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Quick Reference</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            <span><code className="font-mono">*</code> — every value</span>
            <span><code className="font-mono">*/n</code> — every n units</span>
            <span><code className="font-mono">a-b</code> — range a to b</span>
            <span><code className="font-mono">a,b,c</code> — specific values</span>
            <span><code className="font-mono">a-b/n</code> — range + step</span>
            <span><code className="font-mono">L</code> — last (day)</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
