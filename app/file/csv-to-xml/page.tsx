"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import Papa from "papaparse";

const tool = TOOLS.find((t) => t.slug === "csv-to-xml")!;

function sanitizeTag(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_") || "field";
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildXml(
  rows: Record<string, string>[],
  rootTag: string,
  rowTag: string
): string {
  const safeRoot = sanitizeTag(rootTag) || "root";
  const safeRow = sanitizeTag(rowTag) || "row";
  const items = rows.map((row) => {
    const fields = Object.entries(row)
      .map(
        ([k, v]) =>
          `    <${sanitizeTag(k)}>${escapeXml(v)}</${sanitizeTag(k)}>`
      )
      .join("\n");
    return `  <${safeRow}>\n${fields}\n  </${safeRow}>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${safeRoot}>\n${items.join("\n")}\n</${safeRoot}>`;
}

export default function CsvToXmlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootTag, setRootTag] = useState("root");
  const [rowTag, setRowTag] = useState("row");
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function convert() {
    if (!input.trim()) return;
    const result = Papa.parse<Record<string, string>>(input, {
      header: true,
      skipEmptyLines: true,
    });

    const parseErrors = (result.errors ?? []).map((e) => e.message);
    setErrors(parseErrors);

    const rows = result.data;
    setRowCount(rows.length);
    setOutput(buildXml(rows, rootTag, rowTag));
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
        {/* Tag name fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Root tag name</label>
            <input
              type="text"
              value={rootTag}
              onChange={(e) => setRootTag(e.target.value)}
              placeholder="root"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Row tag name</label>
            <input
              type="text"
              value={rowTag}
              onChange={(e) => setRowTag(e.target.value)}
              placeholder="row"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground font-mono"
            />
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
            Convert to XML
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="ml-auto"
            disabled={!input && !output}
          >
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
          language="xml"
          label="XML Output"
          filename="output.xml"
          mimeType="application/xml"
        />
      </div>
    </ToolLayout>
  );
}
