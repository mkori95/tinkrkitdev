import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — tinkrkit.dev",
  description: "tinkrkit.dev privacy policy. We do not collect or store any files or data you process using our tools.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-6 last:border-0">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Last updated: May 2026</p>
        </div>

        <div className="space-y-6">
          <Section title="Data We Collect">
            <p>
              We do not collect, store, or transmit any files or data you process
              using our tools. All processing happens locally in your browser.
            </p>
          </Section>

          <Section title="Analytics">
            <p>
              We use Google Analytics to understand traffic patterns. This collects
              anonymized usage data (pages visited, browser type, country).
            </p>
          </Section>

          <Section title="Advertising">
            <p>
              We use Google AdSense to display ads. AdSense may use cookies to show
              relevant ads based on your browsing history. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Google&apos;s privacy policy
              </a>{" "}
              for details.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use cookies for analytics and advertising purposes only. No personal
              data is stored.
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
