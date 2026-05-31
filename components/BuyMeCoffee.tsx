import Link from "next/link";

interface BuyMeCoffeeProps {
  variant?: "inline" | "footer";
}

export function BuyMeCoffee({ variant = "inline" }: BuyMeCoffeeProps) {
  const href = "https://buymeacoffee.com/tinkrkit";

  if (variant === "footer") {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-[#FFDD00] px-3 py-1.5 text-xs font-semibold text-[#000000] hover:bg-[#FFDD00]/90 transition-colors"
      >
        <span>☕</span> Buy us a coffee
      </Link>
    );
  }

  return (
    <div className="mt-3 flex justify-start">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-[#FFDD00] px-4 py-2 text-sm font-semibold text-[#000000] hover:bg-[#FFDD00]/90 transition-colors shadow-sm"
      >
        <span>☕</span> Buy me a coffee
      </Link>
    </div>
  );
}
