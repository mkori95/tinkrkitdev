"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "string-reverse")!;

type ReverseMode = "chars" | "words" | "lines" | "each-word";

const MODES: Array<{ mode: ReverseMode; label: string; description: string }> = [
  { mode: "chars", label: "Entire text", description: "Reverse all characters" },
  { mode: "words", label: "Word order", description: "Reverse the order of words" },
  { mode: "lines", label: "Each line", description: "Reverse characters in each line" },
  { mode: "each-word", label: "Each word", description: "Reverse characters in each word" },
];

function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case "chars":
      return text.split("").reverse().join("");
    case "words":
      return text.split(/\s+/).reverse().join(" ");
    case "lines":
      return text
        .split("\n")
        .map((l) => l.split("").reverse().join(""))
        .join("\n");
    case "each-word":
      return text
        .split(/(\s+)/)
        .map((token) => (/\s/.test(token) ? token : token.split("").reverse().join("")))
        .join("");
    default:
      return text;
  }
}

export default function StringReversePage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ReverseMode>("chars");
  const [output, setOutput] = useState("");

  useEffect(() => {
    setOutput(input ? reverseText(input, mode) : "");
  }, [input, mode]);

  function clear() {
    setInput("");
    setOutput("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Input Text"
          placeholder="Type or paste text to reverse…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={8}
        />

        {/* Mode selector */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium">Reverse Mode</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODES.map(({ mode: m, label, description }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                title={description}
                className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !output}>
            Clear
          </Button>
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Reversed Text"
          filename="reversed.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
