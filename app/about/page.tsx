import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BuyMeCoffee } from "@/components/BuyMeCoffee";
import { Wrench, Shield, LogIn, Zap } from "lucide-react";

export const metadata = {
  title: "About — tinkrkit.dev",
  description:
    "tinkrkit.dev is a free, browser-based toolkit built for developers, designers, and everyday users.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Wrench className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">About tinkrkit.dev</h1>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p className="text-lg text-foreground font-medium">
            tinkrkit.dev is a free, browser-based toolkit built for developers,
            designers, and everyday users.
          </p>

          <p>
            Every tool runs entirely in your browser.{" "}
            <span className="text-foreground font-medium">
              Your data never leaves your device.
            </span>{" "}
            No login. No uploads to servers. Ever.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "100% Private",
                body: "All processing happens locally in your browser. Nothing is sent to any server.",
              },
              {
                icon: LogIn,
                title: "No Login",
                body: "No account. No signup. Open any tool and start working immediately.",
              },
              {
                icon: Zap,
                title: "Always Free",
                body: "Every tool is free, forever. Funded by unobtrusive ads. No paywalls.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                </div>
                <p className="text-sm">{body}</p>
              </div>
            ))}
          </div>

          <p className="pt-2 text-sm">
            Built with ❤️ — 2026
          </p>

          {/* Support */}
          <div className="rounded-xl border border-border bg-muted/20 p-5 pt-4">
            <p className="mb-1 text-sm font-semibold text-foreground">Support TinkrKit</p>
            <p className="mb-3 text-sm text-muted-foreground">
              TinkrKit is free and always will be. If it&apos;s saved you time, consider buying us a coffee — it helps keep the lights on.
            </p>
            <BuyMeCoffee variant="inline" />
          </div>

          {/* Chrome Extension teaser */}
          <div className="rounded-xl border border-border bg-muted/20 p-5 pt-4">
            <p className="mb-1 text-sm font-semibold text-foreground">
              🧩 TinkrKit Chrome Extension
            </p>
            <p className="mb-3 text-sm text-muted-foreground">
              Use TinkrKit tools directly from your browser. Right-click any text → Open in TinkrKit.
              No tab switching, no copy-pasting.
            </p>
            <a
              href="https://chromewebstore.google.com/search/TinkrKit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
            >
              Add to Chrome →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
