"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find((t) => t.slug === "character-counter")!;

function charStats(text: string) {
  return {
    total: text.length,
    noSpaces: text.replace(/\s/g, "").length,
    letters: (text.match(/[a-zA-Z]/g) || []).length,
    numbers: (text.match(/[0-9]/g) || []).length,
    special: (text.match(/[^a-zA-Z0-9\s]/g) || []).length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
  };
}

function topChars(text: string, n = 5): Array<{ char: string; count: number }> {
  const freq: Record<string, number> = {};
  for (const ch of text) {
    if (ch.trim()) freq[ch] = (freq[ch] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([char, count]) => ({ char, count }));
}

export default function CharacterCounterPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState(charStats(""));
  const [top, setTop] = useState<Array<{ char: string; count: number }>>([]);

  useEffect(() => {
    setStats(charStats(input));
    setTop(topChars(input));
  }, [input]);

  const statItems = [
    { label: "Total Characters", value: stats.total },
    { label: "Without Spaces", value: stats.noSpaces },
    { label: "Letters", value: stats.letters },
    { label: "Numbers", value: stats.numbers },
    { label: "Special Chars", value: stats.special },
    { label: "Words", value: stats.words },
  ];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <InputArea
          value={input}
          onChange={setInput}
          label="Your Text"
          placeholder="Type or paste your text here…"
          accept=".txt"
          maxSizeBytes={2097152}
          rows={8}
          mono={false}
        />

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
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

        {top.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium mb-3">Top Characters</p>
            <div className="flex flex-wrap gap-2">
              {top.map(({ char, count }) => (
                <span
                  key={char}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-mono"
                >
                  <span className="font-bold text-primary">{char === " " ? "·" : char}</span>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
