"use client";

import { useState, useEffect } from "react";
import { getUrlInput } from "@/lib/url-input";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, Copy, Check, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "jwt-decoder")!;

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format — expected 3 parts separated by dots.");
  const decode = (s: string): Record<string, unknown> => {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  };
  return { header: decode(parts[0]), payload: decode(parts[1]), signature: parts[2] };
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

function relativeTime(ts: number): string {
  const diff = ts - Date.now() / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return diff < 0 ? "just now (expired)" : "in a few seconds";
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return diff < 0 ? `${m} minute${m > 1 ? "s" : ""} ago` : `in ${m} minute${m > 1 ? "s" : ""}`;
  }
  if (abs < 86400) {
    const h = Math.round(abs / 3600);
    return diff < 0 ? `${h} hour${h > 1 ? "s" : ""} ago` : `in ${h} hour${h > 1 ? "s" : ""}`;
  }
  const d = Math.round(abs / 86400);
  return diff < 0 ? `${d} day${d > 1 ? "s" : ""} ago` : `in ${d} day${d > 1 ? "s" : ""}`;
}

function JsonBlock({ data, label }: { data: Record<string, unknown>; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/60 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
        </button>
      </div>
      <pre className="overflow-auto bg-[#1e1e2e] p-4 font-mono text-sm text-[#cdd6f4] leading-relaxed">
        {json}
      </pre>
    </div>
  );
}

export default function JwtDecoderPage() {
  const [input, setInput] = useState<string>(() => getUrlInput());
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  // Auto-decode when opened via Chrome extension (?input=...)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (input) handleDecode(); }, []);

  function handleDecode() {
    if (!input.trim()) return;
    try {
      const result = decodeJwt(input);
      setDecoded(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setDecoded(null);
    }
  }

  function clear() {
    setInput("");
    setDecoded(null);
    setError("");
  }

  const exp = decoded?.payload?.exp as number | undefined;
  const iat = decoded?.payload?.iat as number | undefined;
  const isExpired = exp !== undefined && exp < Date.now() / 1000;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">JWT Token</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here, e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            rows={4}
            className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary"
            spellCheck={false}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDecode} disabled={!input.trim()}>
            Decode JWT
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

        {decoded && (
          <div className="space-y-4">
            {/* Expiry status */}
            {exp !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
                  isExpired
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                )}
              >
                {isExpired ? (
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {isExpired
                    ? `Token expired — ${relativeTime(exp)} (${formatDate(exp)})`
                    : `Token valid — expires ${relativeTime(exp)} (${formatDate(exp)})`}
                </span>
              </div>
            )}

            {/* Issued at */}
            {iat !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                Issued at: {formatDate(iat)} ({relativeTime(iat)})
              </div>
            )}

            <JsonBlock data={decoded.header} label="Header" />
            <JsonBlock data={decoded.payload} label="Payload" />

            {/* Signature */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between bg-muted/60 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signature</span>
                <span className="text-xs text-amber-600 dark:text-amber-400">Not verified</span>
              </div>
              <pre className="overflow-auto bg-[#1e1e2e] p-4 font-mono text-sm text-[#f38ba8] leading-relaxed break-all whitespace-pre-wrap">
                {decoded.signature}
              </pre>
            </div>

            <p className="text-xs text-muted-foreground">
              Signature verification requires the secret key and is not performed client-side.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
