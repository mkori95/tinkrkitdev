"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { PanelLayout } from "@/components/PanelLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { getUrlInput } from "@/lib/url-input";

const tool = TOOLS.find((t) => t.slug === "xml-formatter")!;

const PARSER = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export default function XmlFormatterPage() {
  const [input,  setInput]  = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [indent, setIndent] = useState(2);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) format(); }, []);

  function format(indentVal = indent) {
    if (!input.trim()) return;
    try {
      const p = PARSER.parse(input);
      setParsed(p);
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        format: true,
        indentBy: " ".repeat(indentVal),
        suppressEmptyNode: false,
      });
      setOutput(builder.build(p));
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

  const controls = (
    <>
      <Button onClick={() => format()} disabled={!input.trim()}>Format XML</Button>
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
        toolSlug="xml-formatter"
        controls={controls}
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
            <HighlightedOutput
              value={output}
              language="xml"
              label="Formatted XML"
              filename="formatted.xml"
              mimeType="application/xml"
              treeData={parsed ?? undefined}
            />
          </>
        }
      />
    </ToolLayout>
  );
}
