"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      // Using Formspree — replace YOUR_FORM_ID after signing up at formspree.io
      // with your support@tinkrkit.dev address to receive submissions.
      const res = await fetch("https://formspree.io/f/xpwzqjbn", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;d love to hear from you. Fill out the form and we&apos;ll get back to you shortly.
            </p>
          </div>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-lg font-semibold">Message sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks for reaching out. We&apos;ll reply to{" "}
                <span className="font-medium text-foreground">{form.email || "your email"}</span> soon.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="What's this about?"
                value={form.subject}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Tell us more…"
                value={form.message}
                onChange={handleChange}
                className={`${inputCls} resize-none`}
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Something went wrong. Please try again or email us directly at{" "}
                <a href="mailto:support@tinkrkit.dev" className="underline">
                  support@tinkrkit.dev
                </a>
              </div>
            )}

            <Button type="submit" disabled={status === "sending"} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending…" : "Send Message"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Or email us directly at{" "}
              <a href="mailto:support@tinkrkit.dev" className="text-primary hover:underline">
                support@tinkrkit.dev
              </a>
            </p>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
