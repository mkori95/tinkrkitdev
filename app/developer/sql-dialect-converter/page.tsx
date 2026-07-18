"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import { HighlightedOutput } from "@/components/HighlightedOutput";
import { InputArea } from "@/components/InputArea";

const tool = TOOLS.find((t) => t.slug === "sql-dialect-converter")!;

// ── Dialect definitions ────────────────────────────────────────────────────────
const DIALECTS = [
  { value: "mysql",      label: "MySQL / MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite",     label: "SQLite" },
  { value: "sqlserver",  label: "SQL Server (T-SQL)" },
  { value: "bigquery",   label: "BigQuery" },
] as const;

type Dialect = (typeof DIALECTS)[number]["value"];

// ── Conversion rule engine ─────────────────────────────────────────────────────
interface ConversionRule {
  /** Which source dialects this rule applies to */
  from: Dialect[];
  /** Which target dialects this rule produces output for */
  to: Dialect[];
  /** Regex to find the pattern */
  pattern: RegExp;
  /** Replacement string or function */
  replacement: string | ((match: string, ...args: string[]) => string);
  /** Human-readable description */
  description: string;
}

const RULES: ConversionRule[] = [
  // ── Identifier quoting ───────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql", "sqlite", "bigquery"],
    pattern: /`([^`]+)`/g,
    replacement: '"$1"',
    description: "Backtick → double-quote identifiers",
  },
  {
    from: ["mysql"],
    to: ["sqlserver"],
    pattern: /`([^`]+)`/g,
    replacement: "[$1]",
    description: "Backtick → square-bracket identifiers",
  },
  {
    from: ["postgresql", "sqlite", "bigquery"],
    to: ["mysql"],
    pattern: /"([^"]+)"/g,
    replacement: "`$1`",
    description: "Double-quote → backtick identifiers",
  },
  {
    from: ["sqlserver"],
    to: ["mysql"],
    pattern: /\[([^\]]+)\]/g,
    replacement: "`$1`",
    description: "Square-bracket → backtick identifiers",
  },
  {
    from: ["sqlserver"],
    to: ["postgresql", "sqlite", "bigquery"],
    pattern: /\[([^\]]+)\]/g,
    replacement: '"$1"',
    description: "Square-bracket → double-quote identifiers",
  },
  {
    from: ["postgresql", "sqlite"],
    to: ["sqlserver"],
    pattern: /"([^"]+)"/g,
    replacement: "[$1]",
    description: "Double-quote → square-bracket identifiers",
  },

  // ── Auto-increment ───────────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql"],
    pattern: /\bINT\s+AUTO_INCREMENT\b/gi,
    replacement: "SERIAL",
    description: "INT AUTO_INCREMENT → SERIAL",
  },
  {
    from: ["mysql"],
    to: ["sqlite"],
    pattern: /\bINT\s+AUTO_INCREMENT\b/gi,
    replacement: "INTEGER",
    description: "INT AUTO_INCREMENT → INTEGER (SQLite implicit rowid)",
  },
  {
    from: ["mysql"],
    to: ["sqlserver"],
    pattern: /\bINT\s+AUTO_INCREMENT\b/gi,
    replacement: "INT IDENTITY(1,1)",
    description: "INT AUTO_INCREMENT → INT IDENTITY(1,1)",
  },
  {
    from: ["mysql"],
    to: ["bigquery"],
    pattern: /\bINT\s+AUTO_INCREMENT\b/gi,
    replacement: "INT64",
    description: "INT AUTO_INCREMENT → INT64 (BigQuery has no sequences)",
  },
  {
    from: ["postgresql"],
    to: ["mysql"],
    pattern: /\bSERIAL\b/gi,
    replacement: "INT AUTO_INCREMENT",
    description: "SERIAL → INT AUTO_INCREMENT",
  },
  {
    from: ["sqlserver"],
    to: ["mysql"],
    pattern: /\bINT\s+IDENTITY\s*\(\s*1\s*,\s*1\s*\)/gi,
    replacement: "INT AUTO_INCREMENT",
    description: "INT IDENTITY(1,1) → INT AUTO_INCREMENT",
  },
  {
    from: ["sqlserver"],
    to: ["postgresql"],
    pattern: /\bINT\s+IDENTITY\s*\(\s*1\s*,\s*1\s*\)/gi,
    replacement: "SERIAL",
    description: "INT IDENTITY(1,1) → SERIAL",
  },

  // ── Boolean type ─────────────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql", "sqlite", "bigquery"],
    pattern: /\bTINYINT\s*\(\s*1\s*\)/gi,
    replacement: "BOOLEAN",
    description: "TINYINT(1) → BOOLEAN",
  },
  {
    from: ["mysql"],
    to: ["sqlserver"],
    pattern: /\bTINYINT\s*\(\s*1\s*\)/gi,
    replacement: "BIT",
    description: "TINYINT(1) → BIT",
  },
  {
    from: ["postgresql", "sqlite", "bigquery"],
    to: ["mysql"],
    pattern: /\bBOOLEAN\b/gi,
    replacement: "TINYINT(1)",
    description: "BOOLEAN → TINYINT(1)",
  },
  {
    from: ["sqlserver"],
    to: ["mysql"],
    pattern: /\bBIT\b/gi,
    replacement: "TINYINT(1)",
    description: "BIT → TINYINT(1)",
  },
  {
    from: ["sqlserver"],
    to: ["postgresql", "bigquery"],
    pattern: /\bBIT\b/gi,
    replacement: "BOOLEAN",
    description: "BIT → BOOLEAN",
  },

  // ── NULL functions ───────────────────────────────────────────────────────────
  {
    from: ["mysql", "sqlite"],
    to: ["postgresql", "bigquery"],
    pattern: /\bIFNULL\s*\(/gi,
    replacement: "COALESCE(",
    description: "IFNULL() → COALESCE()",
  },
  {
    from: ["sqlserver"],
    to: ["postgresql", "mysql", "sqlite", "bigquery"],
    pattern: /\bISNULL\s*\(/gi,
    replacement: "COALESCE(",
    description: "ISNULL() → COALESCE()",
  },
  {
    from: ["postgresql", "bigquery"],
    to: ["mysql", "sqlite"],
    pattern: /\bCOALESCE\s*\(\s*([^,]+),/gi,
    replacement: "IFNULL($1,",
    description: "COALESCE(x, y) → IFNULL(x, y) (two-arg form)",
  },

  // ── String aggregation ───────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql"],
    pattern: /\bGROUP_CONCAT\s*\(([^)]+)\)/gi,
    replacement: (_, inner) => `STRING_AGG(${inner.trim()}, ',')`,
    description: "GROUP_CONCAT() → STRING_AGG()",
  },
  {
    from: ["mysql"],
    to: ["bigquery"],
    pattern: /\bGROUP_CONCAT\s*\(([^)]+)\)/gi,
    replacement: (_, inner) => `STRING_AGG(${inner.trim()})`,
    description: "GROUP_CONCAT() → STRING_AGG() (BigQuery)",
  },
  {
    from: ["postgresql", "bigquery"],
    to: ["mysql"],
    pattern: /\bSTRING_AGG\s*\(([^,]+),\s*'[^']*'\s*\)/gi,
    replacement: (_, col) => `GROUP_CONCAT(${col.trim()})`,
    description: "STRING_AGG() → GROUP_CONCAT()",
  },

  // ── Current timestamp ────────────────────────────────────────────────────────
  {
    from: ["mysql", "postgresql", "bigquery"],
    to: ["sqlserver"],
    pattern: /\bNOW\s*\(\s*\)/gi,
    replacement: "GETDATE()",
    description: "NOW() → GETDATE()",
  },
  {
    from: ["mysql", "postgresql"],
    to: ["sqlite"],
    pattern: /\bNOW\s*\(\s*\)/gi,
    replacement: "datetime('now')",
    description: "NOW() → datetime('now')",
  },
  {
    from: ["sqlserver"],
    to: ["mysql", "postgresql", "bigquery"],
    pattern: /\bGETDATE\s*\(\s*\)/gi,
    replacement: "NOW()",
    description: "GETDATE() → NOW()",
  },
  {
    from: ["sqlserver"],
    to: ["sqlite"],
    pattern: /\bGETDATE\s*\(\s*\)/gi,
    replacement: "datetime('now')",
    description: "GETDATE() → datetime('now')",
  },
  {
    from: ["sqlite"],
    to: ["mysql", "postgresql", "bigquery"],
    pattern: /\bdatetime\s*\(\s*'now'\s*\)/gi,
    replacement: "NOW()",
    description: "datetime('now') → NOW()",
  },
  {
    from: ["sqlite"],
    to: ["sqlserver"],
    pattern: /\bdatetime\s*\(\s*'now'\s*\)/gi,
    replacement: "GETDATE()",
    description: "datetime('now') → GETDATE()",
  },

  // ── LIMIT / TOP ──────────────────────────────────────────────────────────────
  {
    from: ["mysql", "postgresql", "sqlite", "bigquery"],
    to: ["sqlserver"],
    pattern: /\bSELECT\b([\s\S]*?)\bFROM\b/gi,
    replacement: (match) => {
      // LIMIT → TOP is handled via post-processing after all rules run
      return match;
    },
    description: "LIMIT → TOP (handled via post-processing)",
  },
  {
    from: ["sqlserver"],
    to: ["mysql", "postgresql", "sqlite", "bigquery"],
    pattern: /\bSELECT\s+TOP\s+(\d+)\s+/gi,
    replacement: "SELECT ",
    description: "TOP n → removed (LIMIT added at end)",
  },

  // ── INSERT IGNORE ────────────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql"],
    pattern: /\bINSERT\s+IGNORE\s+INTO\b/gi,
    replacement: "INSERT INTO",
    description: "INSERT IGNORE → INSERT (with ON CONFLICT DO NOTHING appended)",
  },
  {
    from: ["mysql"],
    to: ["sqlite"],
    pattern: /\bINSERT\s+IGNORE\s+INTO\b/gi,
    replacement: "INSERT OR IGNORE INTO",
    description: "INSERT IGNORE → INSERT OR IGNORE",
  },
  {
    from: ["sqlite"],
    to: ["mysql"],
    pattern: /\bINSERT\s+OR\s+IGNORE\s+INTO\b/gi,
    replacement: "INSERT IGNORE INTO",
    description: "INSERT OR IGNORE → INSERT IGNORE",
  },
  {
    from: ["sqlite"],
    to: ["postgresql"],
    pattern: /\bINSERT\s+OR\s+IGNORE\s+INTO\b/gi,
    replacement: "INSERT INTO",
    description: "INSERT OR IGNORE → INSERT (PostgreSQL uses ON CONFLICT)",
  },

  // ── String concat ────────────────────────────────────────────────────────────
  {
    from: ["postgresql", "sqlite", "bigquery"],
    to: ["mysql"],
    pattern: /(\S+)\s*\|\|\s*(\S+)/g,
    replacement: "CONCAT($1, $2)",
    description: "|| → CONCAT() in MySQL",
  },
  {
    from: ["mysql"],
    to: ["postgresql", "sqlite", "bigquery"],
    pattern: /\bCONCAT\s*\(([^,]+),\s*([^)]+)\)/gi,
    replacement: "$1 || $2",
    description: "CONCAT(a, b) → a || b",
  },
  {
    from: ["sqlserver"],
    to: ["postgresql", "sqlite", "bigquery"],
    pattern: /\bCONCAT\s*\(([^,]+),\s*([^)]+)\)/gi,
    replacement: "$1 || $2",
    description: "CONCAT(a, b) → a || b",
  },

  // ── ILIKE (PostgreSQL case-insensitive LIKE) ─────────────────────────────────
  {
    from: ["postgresql"],
    to: ["mysql", "sqlite", "sqlserver", "bigquery"],
    pattern: /\bILIKE\b/gi,
    replacement: "LIKE",
    description: "ILIKE → LIKE (note: case sensitivity may differ)",
  },

  // ── Data types ───────────────────────────────────────────────────────────────
  {
    from: ["mysql"],
    to: ["postgresql"],
    pattern: /\bINT\s+UNSIGNED\b/gi,
    replacement: "BIGINT",
    description: "INT UNSIGNED → BIGINT",
  },
  {
    from: ["mysql"],
    to: ["bigquery"],
    pattern: /\bINT\b(?!\s*IDENTITY)/gi,
    replacement: "INT64",
    description: "INT → INT64",
  },
  {
    from: ["bigquery"],
    to: ["mysql", "postgresql", "sqlite", "sqlserver"],
    pattern: /\bINT64\b/gi,
    replacement: "INT",
    description: "INT64 → INT",
  },
  {
    from: ["mysql", "postgresql", "sqlite", "sqlserver"],
    to: ["bigquery"],
    pattern: /\bVARCHAR\s*\(\d+\)/gi,
    replacement: "STRING",
    description: "VARCHAR(n) → STRING (BigQuery)",
  },
  {
    from: ["bigquery"],
    to: ["mysql"],
    pattern: /\bSTRING\b/gi,
    replacement: "VARCHAR(255)",
    description: "STRING → VARCHAR(255)",
  },
  {
    from: ["bigquery"],
    to: ["postgresql", "sqlite"],
    pattern: /\bSTRING\b/gi,
    replacement: "TEXT",
    description: "STRING → TEXT",
  },
  {
    from: ["bigquery"],
    to: ["sqlserver"],
    pattern: /\bSTRING\b/gi,
    replacement: "NVARCHAR(MAX)",
    description: "STRING → NVARCHAR(MAX)",
  },
];

// ── Core conversion function ───────────────────────────────────────────────────
function convertSql(sql: string, from: Dialect, to: Dialect): string {
  if (from === to) return sql;

  let result = sql;

  // Apply matching rules
  for (const rule of RULES) {
    if (rule.from.includes(from) && rule.to.includes(to)) {
      result = result.replace(
        rule.pattern,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule.replacement as any
      );
    }
  }

  // ── Special: LIMIT → TOP for SQL Server ─────────────────────────────────────
  if (to === "sqlserver") {
    // Move LIMIT n to SELECT TOP n
    result = result.replace(
      /^(SELECT\s+)([\s\S]*?)(\bFROM\b[\s\S]*?)\bLIMIT\s+(\d+)(\s*;?\s*)$/im,
      (_, sel, cols, rest, n, end) =>
        `${sel}TOP ${n} ${cols.trim()}\n${rest.trimEnd()}${end}`
    );
    // Also remove trailing LIMIT if present
    result = result.replace(/\bLIMIT\s+\d+\b/gi, "").trim();
  }

  // ── Special: TOP → LIMIT for non-SQL Server ──────────────────────────────────
  if (from === "sqlserver" && to !== "sqlserver") {
    const topMatch = sql.match(/\bSELECT\s+TOP\s+(\d+)\s+/i);
    if (topMatch) {
      result = result.replace(/;?\s*$/, "") + `\nLIMIT ${topMatch[1]};`;
    }
  }

  // ── Special: INSERT IGNORE → ON CONFLICT for PostgreSQL ──────────────────────
  if (from === "mysql" && to === "postgresql") {
    if (/INSERT\s+IGNORE/i.test(sql)) {
      result = result.replace(/;?\s*$/, "") + "\nON CONFLICT DO NOTHING;";
    }
  }

  return result;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SqlDialectConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromDialect, setFromDialect] = useState<Dialect>("mysql");
  const [toDialect, setToDialect] = useState<Dialect>("postgresql");
  const [error, setError] = useState("");

  function handleConvert() {
    if (!input.trim()) return;
    try {
      setOutput(convertSql(input, fromDialect, toDialect));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleSwap() {
    setFromDialect(toDialect);
    setToDialect(fromDialect);
    if (output) {
      setInput(output);
      setOutput("");
    }
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">

        {/* Caveat banner */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="text-amber-700 dark:text-amber-300">
            Handles common syntax patterns — always review the output before running in production.
          </span>
        </div>

        {/* Dialect selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <select
              value={fromDialect}
              onChange={(e) => { setFromDialect(e.target.value as Dialect); setOutput(""); }}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="mt-5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors"
            title="Swap dialects"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <select
              value={toDialect}
              onChange={(e) => { setToDialect(e.target.value as Dialect); setOutput(""); }}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {DIALECTS.filter((d) => d.value !== fromDialect).map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex gap-2 mt-5">
            <Button onClick={handleConvert} disabled={!input.trim()}>
              Convert
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
          </div>
        </div>

        {/* Input / Output panels */}
        <div className="grid gap-4 lg:grid-cols-2">
          <InputArea
            value={input}
            onChange={(v) => { setInput(v); setOutput(""); setError(""); }}
            label={`${DIALECTS.find((d) => d.value === fromDialect)?.label} SQL`}
            placeholder="Paste your SQL query here…"
            accept=".sql,.txt"
            maxSizeBytes={1024 * 1024}
          />
          <HighlightedOutput
            value={output}
            language="sql"
            label={`${DIALECTS.find((d) => d.value === toDialect)?.label} SQL`}
            filename="converted.sql"
            mimeType="text/plain"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Info callout */}
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">What gets converted</p>
          <p>Identifier quoting · Auto-increment syntax · Boolean types · NULL functions (IFNULL/ISNULL/COALESCE) · String aggregation · Timestamps · LIMIT/TOP · INSERT IGNORE / ON CONFLICT · String concatenation · Common data types</p>
        </div>
      </div>
    </ToolLayout>
  );
}
