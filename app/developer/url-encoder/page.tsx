"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "url-encoder")!;

type Tab = "encode" | "decode";

export default function UrlEncoderPage() {
  const [tab, setTab] = useState<Tab>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [spacesOnly, setSpacesOnly] = useState(false);

  function encode() {
    if (!input.trim()) return;
    try {
      const result = spacesOnly
        ? input.replace(/ /g, "%20")
        : encodeURIComponent(input);
      setOutput(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function decode() {
    if (!input.trim()) return;
    try {
      const result = decodeURIComponent(input);
      setOutput(result);
      setError("");
    } catch {
      setError("Malformed URI sequence. Please check your input.");
      setOutput("");
    }
  }

  function clear() {
    setInput("");
    setOutput("");
    setError("");
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Tab toggle */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
          {(["encode", "decode"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <InputArea
          value={input}
          onChange={setInput}
          label={tab === "encode" ? "Text / URL to Encode" : "Encoded URL to Decode"}
          placeholder={
            tab === "encode"
              ? "https://example.com/path?q=hello world&foo=bar baz"
              : "https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world"
          }
          accept=".txt"
          maxSizeBytes={5242880}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={tab === "encode" ? encode : decode}
            disabled={!input.trim()}
          >
            {tab === "encode" ? "Encode URL" : "Decode URL"}
          </Button>

          {tab === "encode" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={spacesOnly}
                onChange={(e) => setSpacesOnly(e.target.checked)}
                className="rounded border-border"
              />
              Encode spaces only
            </label>
          )}

          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">
            Clear
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <HighlightedOutput
          value={output}
          language="text"
          label={tab === "encode" ? "Encoded URL" : "Decoded URL"}
          filename={tab === "encode" ? "encoded-url.txt" : "decoded-url.txt"}
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
