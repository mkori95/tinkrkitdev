// Shared TinkrKit logo component — pure JSX, no image files
// Works in both light and dark mode without any theme detection

interface LogoProps {
  /** Icon + wordmark size. Default: "md" */
  size?: "sm" | "md";
}

export function Logo({ size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconInner = size === "sm" ? 14 : 18;
  const textSize = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      {/* Indigo rounded square with white wrench icon */}
      <div className={`flex shrink-0 items-center justify-center rounded-lg bg-indigo-500 ${iconSize}`}>
        <svg
          width={iconInner}
          height={iconInner}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark: "Tinkr" foreground + "Kit" indigo */}
      <span className={`select-none font-extrabold leading-none tracking-tight ${textSize}`}>
        <span className="text-foreground">Tinkr</span>
        <span className="text-indigo-500">Kit</span>
      </span>
    </div>
  );
}
