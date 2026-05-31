"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "word-counter")!;

function countStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = text.split("\n").length;
  const readingTime = Math.ceil(words / 200);
  return { words, chars, charsNoSpace, sentences, paragraphs, lines, readingTime };
}

export default function WordCounterPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState(countStats(""));

  useEffect(() => {
    setStats(countStats(input));
  }, [input]);

  const statItems = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "No-Space Chars", value: stats.charsNoSpace },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Reading Time", value: `${stats.readingTime} min` },
  ];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Text</label>
            <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start typing or paste your text here…"
            rows={12}
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary"
            spellCheck={true}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-card px-4 py-3 text-center"
            >
              <div className="text-2xl font-bold text-primary">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
