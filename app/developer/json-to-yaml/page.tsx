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
import yaml from "js-yaml";

const tool = TOOLS.find((t) => t.slug === "json-to-yaml")!;

export default function JsonToYamlPage() {
  const [input,  setInput]  = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [indent, setIndent] = useState(2);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) convert(); }, []);

  function convert(indentVal = indent) {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(yaml.dump(parsed, { indent: indentVal, lineWidth: -1 }));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function clear() {
    setInput(""); setOutput(""); setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="json-to-yaml"
        controls={
          <>
            <Button onClick={() => convert()} disabled={!input.trim()}>Convert to YAML</Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label>Indent:</label>
              {[2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => { setIndent(n); if (output) convert(n); }}
                  className={`rounded px-2 py-0.5 text-xs border ${indent === n ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                >
                  {n} spaces
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
          </>
        }
        input={
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); }}
            label="JSON Input"
            placeholder="Paste JSON here…"
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
            <HighlightedOutput value={output} language="text" label="YAML Output"
              filename="output.yaml" mimeType="text/yaml" />
          </>
        }
      />
    </ToolLayout>
  );
}
