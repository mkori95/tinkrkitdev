"use client";

/**
 * TreeView — renders any JS value (parsed JSON / XML / YAML) as an
 * interactive collapsible tree.
 *
 * Colour scheme:
 *   keys    → indigo
 *   strings → green
 *   numbers → orange
 *   booleans→ yellow
 *   null    → grey (muted)
 *   brackets→ muted-foreground
 *
 * Auto-expands up to depth 2; deeper nodes start collapsed.
 */

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type JsonPrimitive = string | number | boolean | null;
type JsonValue     = JsonPrimitive | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
type JsonArray = JsonValue[];

// ── Primitive value rendering ─────────────────────────────────────────────────

function PrimitiveNode({ value }: { value: JsonPrimitive }) {
  if (value === null)
    return <span className="text-muted-foreground italic">null</span>;
  if (typeof value === "boolean")
    return <span className="text-yellow-400">{String(value)}</span>;
  if (typeof value === "number")
    return <span className="text-orange-400">{value}</span>;
  // string
  return <span className="text-green-400">&quot;{String(value)}&quot;</span>;
}

// ── Single tree node (recursive) ──────────────────────────────────────────────

function TreeNode({
  value,
  keyLabel,
  depth = 0,
  isLast = true,
}: {
  value:     JsonValue;
  keyLabel?: string | number; // undefined = root; string = object key; number = array index
  depth?:    number;
  isLast?:   boolean;
}) {
  const isArray  = Array.isArray(value);
  const isObject = !isArray && value !== null && typeof value === "object";
  const isComplex = isArray || isObject;

  const autoOpen  = depth < 2;
  const [open, setOpen] = useState(autoOpen);

  // ── Key label part ──────────────────────────────────────────────────────────
  const KeyPart = keyLabel !== undefined ? (
    <span>
      <span className="text-indigo-400">{JSON.stringify(String(keyLabel))}</span>
      <span className="text-muted-foreground">: </span>
    </span>
  ) : null;

  // ── Primitive leaf ──────────────────────────────────────────────────────────
  if (!isComplex) {
    return (
      <div className="flex items-baseline gap-0 py-px">
        {KeyPart}
        <PrimitiveNode value={value as JsonPrimitive} />
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  // ── Complex (object or array) node ─────────────────────────────────────────
  const entries: [string | number, JsonValue][] = isArray
    ? (value as JsonArray).map((v, i) => [i, v])
    : Object.entries(value as JsonObject);

  const openBracket  = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const summary      = isArray
    ? `${entries.length} item${entries.length !== 1 ? "s" : ""}`
    : `${entries.length} key${entries.length !== 1 ? "s" : ""}`;

  return (
    <div>
      {/* Header row — click to expand/collapse */}
      <div
        className="flex cursor-pointer select-none items-center gap-1 rounded py-px hover:bg-white/5"
        onClick={() => setOpen(v => !v)}
      >
        {/* Chevron */}
        <span className="w-3 shrink-0 text-[10px] text-muted-foreground">
          {open ? "▾" : "▸"}
        </span>

        {KeyPart}

        <span className="text-muted-foreground">{openBracket}</span>

        {!open && (
          <span className="ml-1 text-xs text-muted-foreground/70 italic">
            {summary}
          </span>
        )}

        {!open && (
          <span className="text-muted-foreground">{closeBracket}</span>
        )}

        {!open && !isLast && (
          <span className="text-muted-foreground">,</span>
        )}
      </div>

      {/* Children */}
      {open && (
        <>
          <div className="ml-3 border-l border-border/30 pl-3">
            {entries.map(([k, v], i) => (
              <TreeNode
                key={String(k)}
                value={v}
                keyLabel={isArray ? undefined : k}
                depth={depth + 1}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
          <div className="flex items-center gap-0 py-px">
            <span className="w-3 shrink-0" />
            <span className="text-muted-foreground">{closeBracket}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function TreeView({
  data,
  className,
  style,
}: {
  data:       unknown; // accepts any parsed JSON/YAML/XML value
  className?: string;
  style?:     React.CSSProperties;
}) {
  return (
    <div
      className={[
        "overflow-auto rounded-lg border border-border bg-[#1e1e2e] p-4",
        "font-mono text-sm leading-relaxed text-[#cdd6f4]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ minHeight: "14rem", ...style }}
    >
      <TreeNode value={data as JsonValue} />
    </div>
  );
}
