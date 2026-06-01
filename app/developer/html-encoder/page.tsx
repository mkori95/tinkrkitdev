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
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "html-encoder")!;

type Tab = "encode" | "decode";

function encodeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(s: string): string {
  const el = document.createElement("div");
  el.innerHTML = s;
  return el.innerText;
}

export default function HtmlEncoderPage() {
  const [tab, setTab] = useState<Tab>("encode");
  const [input, setInput] = useState<string>(() => getUrlInput());
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) handleAction(); }, []);

  function handleAction() {
    if (!input.trim()) return;
    try {
      setOutput(tab === "encode" ? encodeHtml(input) : decodeHtml(input));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function clear() {
    setInput(""); setOutput(""); setError("");
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setInput(""); setOutput(""); setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <PanelLayout
        toolSlug="html-encoder"
        controls={
          <>
            <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
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
            <Button onClick={handleAction} disabled={!input.trim()}>
              {tab === "encode" ? "Encode HTML" : "Decode HTML"}
            </Button>
            <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
          </>
        }
        input={
          <InputArea
            value={input}
            onChange={setInput}
            label={tab === "encode" ? "HTML to Encode" : "Encoded HTML to Decode"}
            placeholder={
              tab === "encode"
                ? '<div class="box">Hello & World <em>"quoted"</em></div>'
                : "&lt;div class=&quot;box&quot;&gt;Hello &amp; World&lt;/div&gt;"
            }
            accept=".txt,.html"
            maxSizeBytes={5242880}
          />
        }
        output={
          <>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <HighlightedOutput
              value={output}
              language="text"
              label={tab === "encode" ? "Encoded HTML Entities" : "Decoded HTML"}
              filename={tab === "encode" ? "encoded.txt" : "decoded.html"}
              mimeType={tab === "encode" ? "text/plain" : "text/html"}
            />
          </>
        }
      />
    </ToolLayout>
  );
}
