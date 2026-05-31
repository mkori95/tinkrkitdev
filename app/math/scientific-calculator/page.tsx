"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const tool = TOOLS.find((t) => t.slug === "scientific-calculator")!;

function safeEval(expr: string): number {
  const e = expr
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
    .replace(/√(\d+\.?\d*)/g, "Math.sqrt($1)")
    .replace(/(\d+\.?\d*)²/g, "Math.pow($1,2)")
    .replace(/(\d+\.?\d*)\^(\d+\.?\d*)/g, "Math.pow($1,$2)")
    .replace(/π/g, "Math.PI")
    .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "Math.E")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/\|([^|]+)\|/g, "Math.abs($1)")
    .replace(/⌊([^⌋]+)⌋/g, "Math.floor($1)")
    .replace(/⌈([^⌉]+)⌉/g, "Math.ceil($1)");

  // eslint-disable-next-line no-new-func
  return Function('"use strict"; return (' + e + ")")();
}

type ButtonDef = {
  label: string;
  type: "digit" | "operator" | "fn" | "equals" | "clear" | "special";
  action?: string;
  wide?: boolean;
};

const BUTTONS: ButtonDef[][] = [
  [
    { label: "sin(", type: "fn" },
    { label: "cos(", type: "fn" },
    { label: "tan(", type: "fn" },
    { label: "log(", type: "fn" },
    { label: "ln(", type: "fn" },
    { label: "(", type: "operator" },
    { label: ")", type: "operator" },
    { label: "⌫", type: "special", action: "backspace" },
  ],
  [
    { label: "7", type: "digit" },
    { label: "8", type: "digit" },
    { label: "9", type: "digit" },
    { label: "÷", type: "operator" },
    { label: "√(", type: "fn" },
    { label: "x²", type: "special", action: "square" },
    { label: "xʸ", type: "special", action: "power" },
    { label: "π", type: "fn" },
  ],
  [
    { label: "4", type: "digit" },
    { label: "5", type: "digit" },
    { label: "6", type: "digit" },
    { label: "×", type: "operator" },
    { label: "e", type: "fn" },
    { label: "1/x", type: "special", action: "reciprocal" },
    { label: "%", type: "operator" },
    { label: "±", type: "special", action: "negate" },
  ],
  [
    { label: "1", type: "digit" },
    { label: "2", type: "digit" },
    { label: "3", type: "digit" },
    { label: "-", type: "operator" },
    { label: "|x|", type: "special", action: "abs" },
    { label: "⌊x⌋", type: "special", action: "floor" },
    { label: "⌈x⌉", type: "special", action: "ceil" },
    { label: "AC", type: "clear", action: "allclear" },
  ],
  [
    { label: "0", type: "digit", wide: false },
    { label: ".", type: "digit" },
    { label: "+", type: "operator" },
    { label: "C", type: "clear", action: "clear" },
    { label: "=", type: "equals", wide: true },
  ],
];

export default function ScientificCalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);

  function handleButton(btn: ButtonDef) {
    if (btn.type === "clear") {
      if (btn.action === "allclear") {
        setDisplay("0");
        setExpression("");
        setJustCalculated(false);
      } else {
        // C — clear display only
        setDisplay("0");
        setJustCalculated(false);
      }
      return;
    }

    if (btn.type === "equals") {
      const expr = expression + display;
      try {
        const result = safeEval(expr);
        if (!isFinite(result)) {
          setDisplay("Error");
          setExpression("");
        } else {
          const resultStr = parseFloat(result.toPrecision(12)).toString();
          setExpression(expr + " =");
          setDisplay(resultStr);
          setJustCalculated(true);
        }
      } catch {
        setDisplay("Error");
        setExpression("");
        setJustCalculated(true);
      }
      return;
    }

    if (btn.action === "backspace") {
      if (justCalculated) {
        setDisplay("0");
        setExpression("");
        setJustCalculated(false);
        return;
      }
      if (display === "0" || display === "Error") return;
      const next = display.length > 1 ? display.slice(0, -1) : "0";
      setDisplay(next);
      return;
    }

    if (btn.action === "square") {
      const val = display === "0" ? expression || "0" : display;
      appendToExpression(val + "²");
      return;
    }

    if (btn.action === "power") {
      const val = display === "0" ? expression || "0" : display;
      appendToExpression(val + "^");
      return;
    }

    if (btn.action === "reciprocal") {
      const val = display === "0" ? expression || "0" : display;
      try {
        const result = safeEval("1/(" + val + ")");
        const resultStr = parseFloat(result.toPrecision(12)).toString();
        setExpression("1/(" + val + ") =");
        setDisplay(resultStr);
        setJustCalculated(true);
      } catch {
        setDisplay("Error");
        setExpression("");
        setJustCalculated(true);
      }
      return;
    }

    if (btn.action === "negate") {
      if (display === "0" || display === "Error") return;
      setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
      return;
    }

    if (btn.action === "abs") {
      appendToExpression("|");
      return;
    }
    if (btn.action === "floor") {
      appendToExpression("⌊");
      return;
    }
    if (btn.action === "ceil") {
      appendToExpression("⌈");
      return;
    }

    // digit or operator or fn
    const char = btn.label;

    if (btn.type === "digit") {
      if (justCalculated) {
        setDisplay(char === "." ? "0." : char);
        setExpression("");
        setJustCalculated(false);
        return;
      }
      if (char === ".") {
        if (display.includes(".")) return;
        setDisplay(display + ".");
      } else {
        setDisplay(display === "0" ? char : display + char);
      }
      return;
    }

    if (btn.type === "operator" || btn.type === "fn" || btn.type === "special") {
      appendToExpression(char);
      return;
    }
  }

  function appendToExpression(char: string) {
    if (justCalculated) {
      // Start new expression from last result unless it's a function
      const isFnStart = /^[a-z√π]/.test(char) || char === "(";
      if (isFnStart) {
        setExpression(char);
        setDisplay("0");
      } else {
        setExpression(display + char);
        setDisplay("0");
      }
      setJustCalculated(false);
      return;
    }

    // Flush current display to expression
    if (display !== "0") {
      setExpression(expression + display + char);
      setDisplay("0");
    } else {
      setExpression(expression + char);
    }
  }

  const isError = display === "Error";

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Display */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-right text-xs text-muted-foreground min-h-[1.2em] mb-1 font-mono truncate">
            {expression || " "}
          </div>
          <div className={cn("text-right text-3xl font-bold font-mono truncate", isError && "text-destructive")}>
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          {BUTTONS.map((row, ri) => (
            <div key={ri} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(8, 1fr)` }}>
              {row.map((btn, bi) => {
                const isOperator = btn.type === "operator";
                const isEquals = btn.type === "equals";
                const isClear = btn.type === "clear";
                const isFn = btn.type === "fn";

                return (
                  <button
                    key={bi}
                    onClick={() => handleButton(btn)}
                    className={cn(
                      "rounded-lg py-2.5 px-1 text-xs sm:text-sm font-medium transition-colors active:scale-95 select-none",
                      isEquals && "col-span-4 bg-primary text-primary-foreground hover:bg-primary/90",
                      isClear && "bg-destructive/15 text-destructive hover:bg-destructive/25",
                      isOperator && !isEquals && "bg-primary/15 text-primary hover:bg-primary/25",
                      isFn && "bg-muted/80 text-muted-foreground hover:bg-muted",
                      btn.type === "digit" && "bg-muted hover:bg-muted/70",
                      btn.type === "special" && !isClear && "bg-muted/60 hover:bg-muted/80",
                    )}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tip */}
        <p className="text-xs text-center text-muted-foreground">
          Tip: Use <code className="rounded bg-muted px-1">xʸ</code> for powers,{" "}
          <code className="rounded bg-muted px-1">√(</code> for square root,{" "}
          <code className="rounded bg-muted px-1">π</code> for pi
        </p>
      </div>
    </ToolLayout>
  );
}
