"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { PanelLayout } from "@/components/PanelLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { getUrlInput } from "@/lib/url-input";

const tool = TOOLS.find((t) => t.slug === "json-formatter")!;

export default function JsonFormatterPage() {
  const [input,  setInput]  = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [indent, setIndent] = useState(2);
  // parsed value is kept separately so TreeView always gets the latest parsed data
  const [parsed, setParsed] = useState<unknown | null>(null);

  // Auto-format when opened via Chrome extension (?input=...)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) format(); }, []);

  function format() {
    if (!input.trim()) return;
    try {
      const p = JSON.parse(input);
      setParsed(p);
      setOutput(JSON.stringify(p, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setParsed(null);
    }
  }

  function clear() {
    setInput("");
    setOutput("");
    setError("");
    setParsed(null);
  }

  const controls = (
    <>
      <Button onClick={format} disabled={!input.trim()}>Format JSON</Button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <label>Indent:</label>
        {[2, 4].map((n) => (
          <button
            key={n}
            onClick={() => { setIndent(n); if (output) format(); }}
            className={`rounded px-2 py-0.5 text-xs border ${indent === n ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
          >
            {n} spaces
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
    </>
  );

  const outputPanel = (
    <>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Invalid JSON</p>
            <p className="mt-0.5 font-mono text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}
      <HighlightedOutput
        value={output}
        language="json"
        label="Formatted JSON"
        filename="formatted.json"
        mimeType="application/json"
        treeData={parsed ?? undefined}
      />
    </>
  );

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="json-formatter"
        controls={controls}
        input={
          <InputArea
            value={input}
            onChange={setInput}
            label="JSON Input"
            placeholder='Paste your JSON here, e.g. {"name":"Alice","age":30}'
            accept=".json,.txt"
            maxSizeBytes={5242880}
          />
        }
        output={outputPanel}
      />
    </ToolLayout>
  );
}
