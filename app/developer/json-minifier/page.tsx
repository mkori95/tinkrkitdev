"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "json-minifier")!;

export default function JsonMinifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function minify() {
    if (!input.trim()) return;
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  const savings = input && output
    ? Math.round((1 - output.length / input.replace(/\s+/g, " ").length) * 100)
    : null;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea value={input} onChange={(v) => { setInput(v); setOutput(""); setError(""); }}
          label="JSON Input" placeholder="Paste formatted JSON here…" accept=".json,.txt" maxSizeBytes={5242880} />

        <div className="flex items-center gap-2">
          <Button onClick={minify} disabled={!input.trim()}>Minify JSON</Button>
          {savings !== null && savings > 0 && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              ↓ {savings}% smaller ({output.length} chars)
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-medium">Invalid JSON</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
          </div>
        )}

        <HighlightedOutput value={output} language="json" label="Minified JSON"
          filename="minified.json" mimeType="application/json" />
      </div>
    </ToolLayout>
  );
}
