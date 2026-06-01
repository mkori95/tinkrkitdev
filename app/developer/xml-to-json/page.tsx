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
import { XMLParser } from "fast-xml-parser";

const tool = TOOLS.find((t) => t.slug === "xml-to-json")!;

export default function XmlToJsonPage() {
  const [input, setInput] = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) convert(); }, []);

  function convert() {
    if (!input.trim()) return;
    try {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", parseAttributeValue: true });
      const result = parser.parse(input);
      setParsed(result);
      setOutput(JSON.stringify(result, null, 2));
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

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="xml-to-json"
        controls={
          <>
            <Button onClick={convert} disabled={!input.trim()}>Convert to JSON</Button>
            <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
          </>
        }
        input={
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); setParsed(null); }}
            label="XML Input"
            placeholder="Paste XML here…"
            accept=".xml,.txt"
            maxSizeBytes={5242880}
          />
        }
        output={
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="font-medium">Invalid XML</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
              </div>
            )}
            <HighlightedOutput value={output} language="json" label="JSON Output"
              filename="output.json" mimeType="application/json" treeData={parsed ?? undefined} />
          </>
        }
      />
    </ToolLayout>
  );
}
