import type { Tool } from "@/lib/tools-config";

interface HowToUseProps {
  tool: Tool;
  steps?: string[];
}

const CATEGORY_STEPS: Record<string, string[]> = {
  developer: [
    "Paste your code or data into the input area",
    "Click the action button to process",
    "Copy or download your result",
  ],
  image: [
    "Upload your image by clicking or dragging it into the drop zone",
    "Adjust any settings if needed, then click Convert / Compress",
    "Download your processed image",
  ],
  pdf: [
    "Upload your PDF file (max 10 MB) by clicking or dragging",
    "Wait for the file to be processed in your browser",
    "View, copy, or download your result",
  ],
  file: [
    "Upload your file by clicking or dragging it into the drop zone",
    "Select your desired output format or options",
    "Copy or download your result",
  ],
  text: [
    "Paste or type your text into the input area",
    "See results update instantly as you type",
    "Copy your result with one click",
  ],
  math: [
    "Enter your values into the input fields",
    "Results are calculated instantly",
    "Copy or use the result directly",
  ],
};

export function HowToUse({ tool, steps }: HowToUseProps) {
  const displaySteps = steps ?? CATEGORY_STEPS[tool.category] ?? CATEGORY_STEPS.developer;

  return (
    <div className="mt-8 rounded-xl border border-border bg-muted/20 p-5">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        How to use {tool.name}
      </h2>
      <ol className="space-y-2.5">
        {displaySteps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
