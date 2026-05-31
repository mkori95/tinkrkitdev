import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Content Policy — tinkrkit.dev",
  description: "tinkrkit.dev content policy. How we handle content, what's prohibited, and our data practices.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-6 last:border-0">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export default function ContentPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Content Policy</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Last updated: May 2026</p>
        </div>

        <div className="space-y-6">
          <Section title="How Our Tools Work">
            <p>
              All tools on tinkrkit.dev run entirely in your browser using JavaScript. We do not upload,
              store, or process your files or data on any server. Your data never leaves your device.
            </p>
            <p>
              As we grow, we plan to introduce optional cloud-based features in future phases. Any such
              features will be clearly labeled, opt-in, and governed by an updated version of this policy.
            </p>
          </Section>

          <Section title="Prohibited Content">
            <p>
              While our tools are browser-based and we cannot monitor local usage, we strictly prohibit
              the use of tinkrkit.dev for processing, distributing, or facilitating any of the following:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Content that promotes hate speech, discrimination, or violence against any individual or group</li>
              <li>Sexually explicit, obscene, or adult content</li>
              <li>Spam, phishing, or malicious code</li>
              <li>Content that infringes on third-party intellectual property or copyrights</li>
              <li>Personal data of others without their explicit consent</li>
              <li>Content that violates any applicable law or regulation</li>
            </ul>
          </Section>

          <Section title="Data Storage & Retention">
            <p>
              Today, 100% of our tools process data locally in your browser. No files, inputs, or outputs
              are transmitted to or stored on our servers.
            </p>
            <p>
              We strongly advise against pasting passwords, private keys, medical records, or other
              highly sensitive personal data into any online tool — including ours.
            </p>
            <p>
              In future phases, if we introduce save/share or cloud-processing features, those features
              will have their own data retention terms, and stored data will be deletable on request via
              our contact page.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p>
              We use Google Analytics for anonymized traffic insights and Google AdSense for ads.
              These services may set cookies and collect standard usage data as described in our{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</a>.
            </p>
            <p>
              We are not responsible for the content or practices of any third-party services linked
              from our site.
            </p>
          </Section>

          <Section title="Advertiser & Platform Safety">
            <p>
              We are committed to maintaining a professional, safe environment for users and advertisers
              alike. Content that could harm our users, damage advertiser trust, or violate ad platform
              policies is not permitted on tinkrkit.dev.
            </p>
          </Section>

          <Section title="Reporting Violations">
            <p>
              If you encounter content on tinkrkit.dev that you believe violates this policy, please
              contact us at{" "}
              <a href="mailto:support@tinkrkit.dev" className="text-primary underline underline-offset-2">
                support@tinkrkit.dev
              </a>{" "}
              or use our{" "}
              <a href="/contact" className="text-primary underline underline-offset-2">Contact page</a>.
              We take all reports seriously and will investigate promptly.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We reserve the right to update this Content Policy at any time. Changes will be reflected
              by the &ldquo;Last updated&rdquo; date above. Continued use of tinkrkit.dev after changes
              constitutes acceptance of the updated policy.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
