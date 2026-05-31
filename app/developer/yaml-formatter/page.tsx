"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, CheckCircle } from "lucide-react";
import yaml from "js-yaml";

const tool = TOOLS.find((t) => t.slug === "yaml-formatter")!;

export default function YamlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  function format() {
    if (!input.trim()) return;
    try {
      const parsed = yaml.load(input);
      setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }));
      setError("");
      setValid(true);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setValid(false);
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea value={input} onChange={(v) => { setInput(v); setOutput(""); setError(""); setValid(false); }}
          label="YAML Input" placeholder="Paste YAML here…" accept=".yaml,.yml,.txt" maxSizeBytes={5242880} />

        <div className="flex gap-2">
          <Button onClick={format} disabled={!input.trim()}>Format & Validate</Button>
          {valid && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />Valid YAML
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); setValid(false); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-medium">Invalid YAML</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
          </div>
        )}

        <HighlightedOutput value={output} language="text" label="Formatted YAML"
          filename="formatted.yaml" mimeType="text/yaml" />
      </div>
    </ToolLayout>
  );
}
