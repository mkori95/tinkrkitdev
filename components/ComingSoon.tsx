import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface ComingSoonProps {
  name: string;
  description: string;
  category?: string;
}

export function ComingSoon({ name, description, category }: ComingSoonProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Construction className="h-8 w-8" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold">{name}</h1>
          <p className="mb-8 text-muted-foreground">{description}</p>

          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="mb-1 text-base font-semibold text-amber-800 dark:text-amber-400">
              🚧 Coming Soon
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-500">
              We&apos;re building this tool. Check back soon.
            </p>
          </div>

          <Link
            href={category ? `/${category}` : "/"}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
