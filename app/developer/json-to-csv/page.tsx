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
import Papa from "papaparse";

const tool = TOOLS.find((t) => t.slug === "json-to-csv")!;

export default function JsonToCsvPage() {
  const [input, setInput] = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) convert(); }, []);

  function convert() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (!arr.every((i) => typeof i === "object" && i !== null)) {
        throw new Error("Input must be a JSON array of objects");
      }
      setOutput(Papa.unparse(arr));
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
        toolSlug="json-to-csv"
        controls={
          <>
            <Button onClick={convert} disabled={!input.trim()}>Convert to CSV</Button>
            <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
          </>
        }
        input={
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); }}
            label="JSON Input"
            placeholder={'Paste a JSON array of objects, e.g.\n[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
            accept=".json,.txt"
            maxSizeBytes={5242880}
          />
        }
        output={
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="font-medium">Conversion Error</p><p className="mt-0.5 font-mono text-xs opacity-80">{error}</p></div>
              </div>
            )}
            <HighlightedOutput value={output} language="text" label="CSV Output"
              filename="output.csv" mimeType="text/csv" />
          </>
        }
      />
    </ToolLayout>
  );
}
