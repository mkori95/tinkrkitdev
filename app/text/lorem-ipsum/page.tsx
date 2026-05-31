"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "lorem-ipsum")!;

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "est", "laborum",
];

const LOREM_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(): string {
  const wordCount = Math.floor(Math.random() * 12) + 8;
  const words = Array.from({ length: wordCount }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(): string {
  const sentCount = Math.floor(Math.random() * 4) + 4;
  return Array.from({ length: sentCount }, generateSentence).join(" ");
}

function generate(
  type: "paragraphs" | "sentences" | "words",
  count: number,
  startWithLorem: boolean
): string {
  if (type === "words") {
    const words = startWithLorem
      ? ["Lorem", "ipsum", "dolor", "sit", "amet", ...Array.from({ length: count - 5 }, randomWord)]
      : Array.from({ length: count }, randomWord);
    return words.slice(0, count).join(" ");
  }
  if (type === "sentences") {
    const sentences = Array.from({ length: count }, (_, i) =>
      i === 0 && startWithLorem ? LOREM_START : generateSentence()
    );
    return sentences.join(" ");
  }
  // paragraphs
  const paragraphs = Array.from({ length: count }, (_, i) =>
    i === 0 && startWithLorem ? LOREM_START + " " + generateParagraph() : generateParagraph()
  );
  return paragraphs.join("\n\n");
}

type GenType = "paragraphs" | "sentences" | "words";

const DEFAULTS: Record<GenType, number> = {
  paragraphs: 3,
  sentences: 5,
  words: 50,
};

export default function LoremIpsumPage() {
  const [type, setType] = useState<GenType>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  function handleTypeChange(t: GenType) {
    setType(t);
    setCount(DEFAULTS[t]);
  }

  function handleGenerate() {
    setOutput(generate(type, count, startWithLorem));
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          {/* Type selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Generate</label>
            <div className="flex gap-2">
              {(["paragraphs", "sentences", "words"] as GenType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Count</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-28 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm">Start with &ldquo;Lorem ipsum&hellip;&rdquo;</span>
          </label>

          <Button onClick={handleGenerate}>Generate</Button>
        </div>

        <HighlightedOutput
          value={output}
          language="text"
          label="Generated Text"
          filename="lorem-ipsum.txt"
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
