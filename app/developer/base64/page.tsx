"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "base64")!;

type Tab = "encode" | "decode";

export default function Base64Page() {
  const [tab, setTab] = useState<Tab>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function encode() {
    if (!input.trim()) return;
    try {
      const result = btoa(unescape(encodeURIComponent(input)));
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
      const result = decodeURIComponent(escape(atob(input.trim())));
      setOutput(result);
      setError("");
    } catch {
      setError("Invalid Base64 string. Please check your input.");
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
          label={tab === "encode" ? "Text to Encode" : "Base64 to Decode"}
          placeholder={
            tab === "encode"
              ? "Enter text to encode to Base64..."
              : "Enter Base64 string to decode..."
          }
          accept={tab === "encode" ? ".txt" : undefined}
          maxSizeBytes={5242880}
        />

        <div className="flex gap-2">
          <Button
            onClick={tab === "encode" ? encode : decode}
            disabled={!input.trim()}
          >
            {tab === "encode" ? "Encode to Base64" : "Decode from Base64"}
          </Button>
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
          label={tab === "encode" ? "Base64 Output" : "Decoded Text"}
          filename={tab === "encode" ? "encoded.txt" : "decoded.txt"}
          mimeType="text/plain"
        />
      </div>
    </ToolLayout>
  );
}
