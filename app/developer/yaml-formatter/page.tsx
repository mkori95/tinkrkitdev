"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { PanelLayout } from "@/components/PanelLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, CheckCircle } from "lucide-react";
import yaml from "js-yaml";
import { getUrlInput } from "@/lib/url-input";

const tool = TOOLS.find((t) => t.slug === "yaml-formatter")!;

export default function YamlFormatterPage() {
  const [input,  setInput]  = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [valid,  setValid]  = useState(false);
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [indent, setIndent] = useState(2);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) format(); }, []);

  function format(indentVal = indent) {
    if (!input.trim()) return;
    try {
      const p = yaml.load(input);
      setParsed(p ?? null);
      setOutput(yaml.dump(p, { indent: indentVal, lineWidth: -1 }));
      setError("");
      setValid(true);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setValid(false);
      setParsed(null);
    }
  }

  function clear() {
    setInput(""); setOutput(""); setError(""); setValid(false); setParsed(null);
  }

  const controls = (
    <>
      <Button onClick={() => format()} disabled={!input.trim()}>Format & Validate</Button>
      {valid && (
        <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />Valid YAML
        </span>
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <label>Indent:</label>
        {[2, 4].map((n) => (
          <button
            key={n}
            onClick={() => { setIndent(n); if (output) format(n); }}
            className={`rounded px-2 py-0.5 text-xs border ${indent === n ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
          >
            {n} spaces
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
    </>
  );

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="yaml-formatter"
        controls={controls}
        input={
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); setValid(false); setParsed(null); }}
            label="YAML Input"
            placeholder="Paste YAML here…"
            accept=".yaml,.yml,.txt"
            maxSizeBytes={5242880}
          />
        }
        output={
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="font-medium">Invalid YAML</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
              </div>
            )}
            <HighlightedOutput
              value={output}
              language="text"
              label="Formatted YAML"
              filename="formatted.yaml"
              mimeType="text/yaml"
              treeData={parsed ?? undefined}
            />
          </>
        }
      />
    </ToolLayout>
  );
}
