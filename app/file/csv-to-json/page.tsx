"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

const tool = TOOLS.find((t) => t.slug === "csv-to-json")!;

type Mode = "objects" | "arrays";

export default function CsvToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("objects");
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function convert() {
    if (!input.trim()) return;
    const useHeader = mode === "objects";
    const result = Papa.parse(input, {
      header: useHeader,
      skipEmptyLines: true,
    });

    const parseErrors = (result.errors ?? []).map((e) => e.message);
    setErrors(parseErrors);

    const rows = result.data as Record<string, string>[];
    setRowCount(rows.length);
    setOutput(JSON.stringify(rows, null, 2));
  }

  function clear() {
    setInput("");
    setOutput("");
    setErrors([]);
    setRowCount(null);
  }

  function handleInputChange(val: string) {
    setInput(val);
    setOutput("");
    setErrors([]);
    setRowCount(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Output format:</span>
          <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {(["objects", "arrays"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setOutput("");
                  setErrors([]);
                  setRowCount(null);
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "objects" ? "Array of objects" : "Array of arrays"}
              </button>
            ))}
          </div>
        </div>

        <InputArea
          value={input}
          onChange={handleInputChange}
          label="CSV Input"
          placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
          accept=".csv,.txt"
          maxSizeBytes={5 * 1024 * 1024}
          rows={12}
        />

        <div className="flex items-center gap-2">
          <Button onClick={convert} disabled={!input.trim()}>
            Convert to JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto" disabled={!input && !output}>
            Clear
          </Button>
        </div>

        {/* Parse errors */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Parse warnings
            </div>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-destructive/80 font-mono pl-6">
                {e}
              </p>
            ))}
          </div>
        )}

        {/* Row count badge */}
        {rowCount !== null && output && (
          <p className="text-xs text-muted-foreground">
            {rowCount} row{rowCount !== 1 ? "s" : ""} converted
          </p>
        )}

        <HighlightedOutput
          value={output}
          language="json"
          label="JSON Output"
          filename="output.json"
          mimeType="application/json"
        />
      </div>
    </ToolLayout>
  );
}
