"use client";

import { useState, useEffect } from "react";
import { getUrlInput } from "@/lib/url-input";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "json-validator")!;

interface ValidationResult {
  valid: boolean;
  message: string;
  detail?: string;
  stats?: { keys: number; depth: number; chars: number };
}

function countKeys(obj: unknown, depth = 0): { keys: number; depth: number } {
  if (typeof obj !== "object" || obj === null) return { keys: 0, depth };
  let keys = 0;
  let maxDepth = depth;
  for (const val of Object.values(obj as Record<string, unknown>)) {
    keys++;
    const child = countKeys(val, depth + 1);
    keys += child.keys;
    maxDepth = Math.max(maxDepth, child.depth);
  }
  return { keys, depth: maxDepth };
}

export default function JsonValidatorPage() {
  const [input, setInput] = useState<string>(() => getUrlInput());
  const [result, setResult] = useState<ValidationResult | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) validate(); }, []);

  function validate() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const { keys, depth } = countKeys(parsed);
      setResult({
        valid: true,
        message: "Valid JSON",
        stats: { keys, depth, chars: input.length },
      });
    } catch (e) {
      const msg = (e as Error).message;
      setResult({ valid: false, message: "Invalid JSON", detail: msg });
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={(v) => { setInput(v); setResult(null); }}
          label="JSON Input"
          placeholder='Paste JSON to validate…'
          accept=".json,.txt" maxSizeBytes={5242880}
        />

        <div className="flex gap-2">
          <Button onClick={validate} disabled={!input.trim()}>Validate</Button>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setResult(null); }}>Clear</Button>
        </div>

        {result && (
          <div className={`rounded-xl border px-5 py-4 ${result.valid
            ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30"
            : "border-destructive/30 bg-destructive/10"}`}>
            <div className="flex items-center gap-2">
              {result.valid
                ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                : <AlertCircle className="h-5 w-5 text-destructive" />}
              <p className={`font-semibold ${result.valid ? "text-green-800 dark:text-green-300" : "text-destructive"}`}>
                {result.message}
              </p>
            </div>
            {result.detail && (
              <p className="mt-2 font-mono text-xs text-destructive/80">{result.detail}</p>
            )}
            {result.stats && (
              <div className="mt-3 grid grid-cols-3 gap-3 border-t border-green-200 pt-3 dark:border-green-900/50">
                {[
                  ["Characters", result.stats.chars.toLocaleString()],
                  ["Keys / Fields", result.stats.keys.toLocaleString()],
                  ["Max Depth", result.stats.depth.toString()],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" />{label}</span>
                    <span className="text-base font-bold text-green-800 dark:text-green-300">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
