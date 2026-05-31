"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "case-converter")!;

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toPascalCase(s: string) {
  const c = toCamelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
function toSnakeCase(s: string) {
  return s.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
}
function toKebabCase(s: string) {
  return s.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}
function toConstantCase(s: string) {
  return toSnakeCase(s).toUpperCase();
}
function toAlternate(s: string) {
  return s
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}
function toInverse(s: string) {
  return s
    .split("")
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

const CONVERSIONS: Array<{ label: string; fn: (s: string) => string }> = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "Title Case", fn: toTitleCase },
  { label: "Sentence case", fn: toSentenceCase },
  { label: "camelCase", fn: toCamelCase },
  { label: "PascalCase", fn: toPascalCase },
  { label: "snake_case", fn: toSnakeCase },
  { label: "kebab-case", fn: toKebabCase },
  { label: "CONSTANT_CASE", fn: toConstantCase },
  { label: "aLtErNaTe", fn: toAlternate },
  { label: "iNVERSE cAsE", fn: toInverse },
];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeLabel, setActiveLabel] = useState("");

  function convert(label: string, fn: (s: string) => string) {
    setOutput(fn(input));
    setActiveLabel(label);
  }

  function clear() {
    setInput("");
    setOutput("");
    setActiveLabel("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Input Text"
          placeholder="Type or paste your text here…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={8}
          mono={false}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONVERSIONS.map(({ label, fn }) => (
            <button
              key={label}
              onClick={() => convert(label, fn)}
              disabled={!input.trim()}
              className={`rounded-md border px-3 py-2 text-sm font-mono transition-colors disabled:opacity-40 disabled:pointer-events-none
                ${activeLabel === label
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clear} disabled={!input && !output}>
            Clear
          </Button>
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label={activeLabel ? `Result — ${activeLabel}` : "Result"}
          filename="converted.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
