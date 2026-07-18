import Link from "next/link";

interface BuyMeCoffeeProps {
  variant?: "inline" | "footer";
}

export function BuyMeCoffee({ variant = "inline" }: BuyMeCoffeeProps) {
  const href = "https://paypal.me/tinkrkitdev";

  if (variant === "footer") {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-[#003087] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00257a] transition-colors"
      >
        <span>💙</span> Tip via PayPal
      </Link>
    );
  }

  return (
    <div className="mt-3 flex justify-start">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        <span>❤️</span> Support TinkrKit
      </Link>
    </div>
  );
}
