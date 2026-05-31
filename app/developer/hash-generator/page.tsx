"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { Copy, Check, Upload } from "lucide-react";
import CryptoJS from "crypto-js";

const tool = TOOLS.find((t) => t.slug === "hash-generator")!;

interface Hashes {
  MD5: string;
  "SHA-1": string;
  "SHA-256": string;
  "SHA-512": string;
}

function computeHashes(text: string): Hashes {
  return {
    MD5: CryptoJS.MD5(text).toString(),
    "SHA-1": CryptoJS.SHA1(text).toString(),
    "SHA-256": CryptoJS.SHA256(text).toString(),
    "SHA-512": CryptoJS.SHA512(text).toString(),
  };
}

function HashRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground pt-0.5">{label}</span>
      <span className="flex-1 font-mono text-xs break-all text-foreground leading-relaxed">
        {value || <span className="text-muted-foreground/60">—</span>}
      </span>
      <button
        onClick={copy}
        disabled={!value}
        title="Copy"
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input) {
      const h = computeHashes(input);
      if (uppercase) {
        setHashes({
          MD5: h.MD5.toUpperCase(),
          "SHA-1": h["SHA-1"].toUpperCase(),
          "SHA-256": h["SHA-256"].toUpperCase(),
          "SHA-512": h["SHA-512"].toUpperCase(),
        });
      } else {
        setHashes(h);
      }
    } else {
      setHashes(null);
    }
  }, [input, uppercase]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  function clear() {
    setInput("");
    setHashes(null);
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input Text</label>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3 w-3" />
              Upload file
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash, or upload a file..."
            rows={8}
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-border"
            />
            Uppercase output
          </label>
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto" disabled={!input}>
            Clear
          </Button>
        </div>

        {/* Hash outputs */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hash Results {input ? `(${input.length} character${input.length !== 1 ? "s" : ""})` : ""}
            </span>
          </div>
          <div className="px-4">
            {(["MD5", "SHA-1", "SHA-256", "SHA-512"] as const).map((algo) => (
              <HashRow
                key={algo}
                label={algo}
                value={hashes?.[algo] ?? ""}
              />
            ))}
          </div>
        </div>

        {!input && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Hashes update live as you type. All computation is done locally in your browser.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
