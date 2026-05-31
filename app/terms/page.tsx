import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — tinkrkit.dev",
  description: "Terms of service for tinkrkit.dev.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-6 last:border-0">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Last updated: May 2026</p>
        </div>

        <div className="space-y-6">
          <Section title="Use of Service">
            <p>
              tinkrkit.dev provides free online tools for personal and commercial use.
            </p>
          </Section>

          <Section title="No Warranty">
            <p>
              Tools are provided as-is. We make no guarantees about accuracy or
              availability.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              tinkrkit.dev is not liable for any damages arising from use of our tools.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We reserve the right to modify or discontinue any tool at any time.
            </p>
          </Section>

          <Section title="Contact">
            <a
              href="mailto:support@tinkrkit.dev"
              className="text-primary underline underline-offset-2"
            >
              support@tinkrkit.dev
            </a>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
