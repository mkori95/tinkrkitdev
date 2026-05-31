"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, Copy, Check } from "lucide-react";
import Papa from "papaparse";

const tool = TOOLS.find((t) => t.slug === "csv-viewer")!;

export default function CsvViewerPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function parse() {
    if (!input.trim()) return;
    const result = Papa.parse<string[]>(input.trim(), { skipEmptyLines: true });
    if (result.errors.length && !result.data.length) {
      setError(result.errors[0].message);
      setRows([]);
      setHeaders([]);
      return;
    }
    const [head, ...data] = result.data;
    setHeaders(head);
    setRows(data);
    setError("");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea value={input}
          onChange={(v) => { setInput(v); setRows([]); setHeaders([]); setError(""); }}
          label="CSV Input" placeholder="Paste CSV data here…" accept=".csv,.txt" maxSizeBytes={5242880} mono />

        <div className="flex gap-2">
          <Button onClick={parse} disabled={!input.trim()}>View as Table</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!input}>
            {copied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy CSV</>}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setRows([]); setHeaders([]); setError(""); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-auto rounded-xl border border-border">
            <div className="mb-2 px-3 pt-3 text-xs text-muted-foreground">
              {rows.length} rows × {headers.length} columns
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-muted-foreground whitespace-nowrap font-mono text-xs">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
