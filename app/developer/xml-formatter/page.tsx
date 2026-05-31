"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

const tool = TOOLS.find((t) => t.slug === "xml-formatter")!;

function formatXml(xml: string, indent: number): string {
  // Parse then rebuild with indentation
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: " ".repeat(indent),
    suppressEmptyNode: false,
  });
  const parsed = parser.parse(xml);
  return builder.build(parsed);
}

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    if (!input.trim()) return;
    try {
      setOutput(formatXml(input, indent));
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
          label="XML Input" placeholder="Paste XML here…" accept=".xml,.txt" maxSizeBytes={5242880} />

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={format} disabled={!input.trim()}>Format XML</Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label>Indent:</label>
            {[2, 4].map((n) => (
              <button key={n} onClick={() => setIndent(n)}
                className={`rounded px-2 py-0.5 text-xs border ${indent === n ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {n} spaces
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-medium">Invalid XML</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
          </div>
        )}

        <HighlightedOutput value={output} language="xml" label="Formatted XML"
          filename="formatted.xml" mimeType="application/xml" />
      </div>
    </ToolLayout>
  );
}
