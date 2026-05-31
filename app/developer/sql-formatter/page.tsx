"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { format } from "sql-formatter";

const tool = TOOLS.find((t) => t.slug === "sql-formatter")!;

const DIALECTS = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "bigquery", label: "BigQuery" },
] as const;

type Dialect = (typeof DIALECTS)[number]["value"];

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");

  function formatSql() {
    if (!input.trim()) return;
    try {
      setOutput(format(input, { language: dialect, tabWidth: 2, keywordCase: "upper" }));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea value={input} onChange={(v) => { setInput(v); setOutput(""); setError(""); }}
          label="SQL Input" placeholder="Paste SQL query here…" accept=".sql,.txt" maxSizeBytes={5242880} />

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={formatSql} disabled={!input.trim()}>Format SQL</Button>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {DIALECTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-medium">Format Error</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
          </div>
        )}

        <HighlightedOutput value={output} language="text" label="Formatted SQL"
          filename="formatted.sql" mimeType="text/plain" />
      </div>
    </ToolLayout>
  );
}
