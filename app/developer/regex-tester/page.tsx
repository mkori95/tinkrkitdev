"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "regex-tester")!;

interface Match {
  index: number;
  value: string;
  groups: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [matches, setMatches] = useState<Match[]>([]);
  const [highlighted, setHighlighted] = useState("");
  const [regexError, setRegexError] = useState("");

  const runRegex = useCallback(() => {
    if (!pattern) {
      setMatches([]);
      setHighlighted(escapeHtml(testString));
      setRegexError("");
      return;
    }

    let regex: RegExp;
    try {
      const flagStr = Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join("");
      regex = new RegExp(pattern, flagStr);
      setRegexError("");
    } catch (e) {
      setRegexError((e as Error).message);
      setMatches([]);
      setHighlighted(escapeHtml(testString));
      return;
    }

    const found: Match[] = [];
    if (flags.g) {
      let m: RegExpExecArray | null;
      const re = new RegExp(pattern, Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join(""));
      while ((m = re.exec(testString)) !== null) {
        found.push({
          index: m.index,
          value: m[0],
          groups: m.slice(1),
        });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        found.push({ index: m.index, value: m[0], groups: m.slice(1) });
      }
    }

    setMatches(found);

    // Build highlighted string
    if (found.length === 0) {
      setHighlighted(escapeHtml(testString));
      return;
    }

    let result = "";
    let last = 0;
    for (const match of found) {
      result += escapeHtml(testString.slice(last, match.index));
      result += `<mark class="bg-yellow-300/50 dark:bg-yellow-500/30 rounded px-0.5 text-foreground">${escapeHtml(match.value)}</mark>`;
      last = match.index + match.value.length;
    }
    result += escapeHtml(testString.slice(last));
    setHighlighted(result);
  }, [pattern, testString, flags]);

  useEffect(() => {
    runRegex();
  }, [runRegex]);

  function clear() {
    setPattern("");
    setTestString("");
    setMatches([]);
    setHighlighted("");
    setRegexError("");
  }

  const flagEntries: { key: keyof typeof flags; label: string; title: string }[] = [
    { key: "g", label: "g", title: "Global — find all matches" },
    { key: "i", label: "i", title: "Case insensitive" },
    { key: "m", label: "m", title: "Multiline — ^ and $ match line boundaries" },
  ];

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Pattern + flags row */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Regular Expression</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-lg">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern, e.g. \b\w+@\w+\.\w+\b"
              className={cn(
                "flex-1 rounded-lg border bg-card px-3 py-2 font-mono text-sm outline-none",
                "placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                regexError ? "border-destructive/60" : "border-border"
              )}
              spellCheck={false}
            />
            <span className="text-muted-foreground font-mono text-lg">/</span>
            {/* Flags */}
            {flagEntries.map(({ key, label, title }) => (
              <button
                key={key}
                title={title}
                onClick={() => setFlags((f) => ({ ...f, [key]: !f[key] }))}
                className={cn(
                  "rounded px-2.5 py-1.5 font-mono text-sm border transition-colors",
                  flags[key]
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {regexError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {regexError}
            </div>
          )}
        </div>

        {/* Match count + clear */}
        <div className="flex items-center justify-between">
          {pattern && !regexError ? (
            <span className="text-sm text-muted-foreground">
              {matches.length === 0
                ? "No matches found"
                : `${matches.length} match${matches.length > 1 ? "es" : ""} found`}
            </span>
          ) : (
            <span />
          )}
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        </div>

        {/* Split: test string + highlighted result */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Test string */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Test String</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter the text to test your regex against..."
              rows={12}
              className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Highlighted result */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Highlighted Matches</label>
            <div
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-sm whitespace-pre-wrap break-words min-h-[12rem] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlighted || '<span class="text-muted-foreground/60">Matches will be highlighted here…</span>',
              }}
            />
          </div>
        </div>

        {/* Match list */}
        {matches.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/60 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Match Details
              </span>
            </div>
            <div className="divide-y divide-border">
              {matches.map((m, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-2.5 text-sm">
                  <span className="shrink-0 text-xs text-muted-foreground w-16">
                    Match {i + 1}
                  </span>
                  <span className="font-mono text-primary bg-primary/10 rounded px-1.5 py-0.5 text-xs">
                    {JSON.stringify(m.value)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    at index {m.index}
                  </span>
                  {m.groups.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      groups: {m.groups.map((g, gi) => `$${gi + 1}=${JSON.stringify(g)}`).join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
