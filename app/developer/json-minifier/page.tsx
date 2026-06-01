"use client";

import { useState, useEffect } from "react";
import { getUrlInput } from "@/lib/url-input";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { PanelLayout } from "@/components/PanelLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "json-minifier")!;

export default function JsonMinifierPage() {
  const [input,  setInput]  = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) minify(); }, []);

  function minify() {
    if (!input.trim()) return;
    try {
      const p = JSON.parse(input);
      setParsed(p);
      setOutput(JSON.stringify(p));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setParsed(null);
    }
  }

  function clear() {
    setInput(""); setOutput(""); setError(""); setParsed(null);
  }

  const savings = input && output
    ? Math.round((1 - output.length / input.replace(/\s+/g, " ").length) * 100)
    : null;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="json-minifier"
        controls={
          <>
            <Button onClick={minify} disabled={!input.trim()}>Minify JSON</Button>
            {savings !== null && savings > 0 && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                ↓ {savings}% smaller ({output.length} chars)
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
          </>
        }
        input={
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); setParsed(null); }}
            label="JSON Input"
            placeholder="Paste formatted JSON here…"
            accept=".json,.txt"
            maxSizeBytes={5242880}
          />
        }
        output={
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="font-medium">Invalid JSON</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
              </div>
            )}
            <HighlightedOutput value={output} language="json" label="Minified JSON"
              filename="minified.json" mimeType="application/json" treeData={parsed ?? undefined} />
          </>
        }
      />
    </ToolLayout>
  );
}
