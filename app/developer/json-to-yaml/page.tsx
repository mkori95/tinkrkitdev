"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import yaml from "js-yaml";

const tool = TOOLS.find((t) => t.slug === "json-to-yaml")!;

export default function JsonToYamlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function convert() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }));
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
          label="JSON Input" placeholder="Paste JSON here…" accept=".json,.txt" maxSizeBytes={5242880} />

        <div className="flex gap-2">
          <Button onClick={convert} disabled={!input.trim()}>Convert to YAML</Button>
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="ml-auto">Clear</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-medium">Invalid JSON</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
          </div>
        )}

        <HighlightedOutput value={output} language="text" label="YAML Output"
          filename="output.yaml" mimeType="text/yaml" />
      </div>
    </ToolLayout>
  );
}
