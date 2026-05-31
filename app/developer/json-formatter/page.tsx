"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "json-formatter")!;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function clear() {
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="JSON Input"
          placeholder='Paste your JSON here, e.g. {"name":"Alice","age":30}'
          accept=".json,.txt" maxSizeBytes={5242880}
        />

        <div className="flex flex-wrap items-center gap-2">
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
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
        />
      </div>
    </ToolLayout>
  );
}
