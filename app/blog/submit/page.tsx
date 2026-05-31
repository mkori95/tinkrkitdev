"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { TOOLS } from "@/lib/tools-config";
import { marked } from "marked";
import {
  Send, Eye, EyeOff, Copy, Check, ChevronDown,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const TODAY = new Date().toISOString().slice(0, 10);

const MDX_TEMPLATE = `---
title: "Your Post Title"
slug: "your-post-slug"
date: "${TODAY}"
description: "Short description of your post (max 160 chars)"
tags: ["tag1", "tag2"]
author: "Your Name"
relatedTool: "/developer/json-formatter"
---

## Introduction

Your post content here in markdown...

## Section 2

More content...
`;

// ── Form option (Quick Submit) ────────────────────────────────────────────────

function QuickSubmitForm() {
  const [title,       setTitle]       = useState("");
  const [slug,        setSlug]        = useState("");
  const [slugEdited,  setSlugEdited]  = useState(false);
  const [description, setDescription] = useState("");
  const [content,     setContent]     = useState("");
  const [tagsRaw,     setTagsRaw]     = useState("");
  const [authorName,  setAuthorName]  = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [relatedTool, setRelatedTool] = useState("");
  const [preview,     setPreview]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(title));
  }, [title, slugEdited]);

  const parsedTags = tagsRaw
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !slug || !description || !content || !authorName || !authorEmail) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("blog_posts").insert({
      title,
      slug,
      description,
      content,
      tags:         parsedTags,
      author_name:  authorName,
      author_email: authorEmail,
      related_tool: relatedTool || null,
      status:       "pending",
    });

    setSubmitting(false);
    if (err) {
      if (err.code === "23505") {
        setError("A post with this slug already exists. Please change the slug.");
      } else {
        setError(err.message);
      }
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h3 className="text-lg font-bold text-foreground">Post Submitted!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for contributing! We&apos;ll review your post and publish it within 48 hours.
          You&apos;ll receive an email at <strong>{authorEmail}</strong> once it&apos;s live.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setTitle(""); setSlug(""); setDescription(""); setContent("");
            setTagsRaw(""); setAuthorName(""); setAuthorEmail(""); setRelatedTool("");
            setSlugEdited(false);
          }}
          className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          Submit another post
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. How to Format JSON Like a Pro"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Slug (URL) <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="shrink-0 border-r border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground select-none">
            /blog/
          </span>
          <input
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="your-post-slug"
            required
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
          <span>Description <span className="text-red-400">*</span></span>
          <span className={`text-xs ${description.length > 160 ? "text-red-400" : "text-muted-foreground"}`}>
            {description.length}/160
          </span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A short summary shown in search results and post listings."
          rows={2}
          maxLength={200}
          required
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Content + Preview toggle */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Content (Markdown) <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setPreview(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div
            className="min-h-[240px] rounded-lg border border-border bg-background px-4 py-3 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content ? (marked.parse(content) as string) : "<p class='text-muted-foreground text-sm'>Nothing to preview yet.</p>" }}
          />
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post in Markdown. Use ## headings, **bold**, `code`, etc."
            rows={12}
            required
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Tags</label>
        <input
          value={tagsRaw}
          onChange={e => setTagsRaw(e.target.value)}
          placeholder="json, developer tools, beginner"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {parsedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {parsedTags.map(t => (
              <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Author name + email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Your name <span className="text-red-400">*</span>
          </label>
          <input
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Jane Smith"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={authorEmail}
            onChange={e => setAuthorEmail(e.target.value)}
            placeholder="jane@example.com"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Not shown publicly</p>
        </div>
      </div>

      {/* Related tool */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Related Tool (optional)</label>
        <div className="relative">
          <select
            value={relatedTool}
            onChange={e => setRelatedTool(e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">— None —</option>
            {TOOLS.map(t => (
              <option key={t.slug} value={`/${t.category}/${t.slug}`}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</>
        ) : (
          <><Send className="h-4 w-4" /> Submit for review</>
        )}
      </button>
    </form>
  );
}

// ── GitHub PR option ──────────────────────────────────────────────────────────

function GitHubOption() {
  const [copied, setCopied] = useState(false);

  async function copyTemplate() {
    await navigator.clipboard.writeText(MDX_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Prefer working in your editor? Fork the TinkrKit repo on GitHub, add your post as an MDX file in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">/content/blog/</code>, and
        open a pull request. We&apos;ll review and merge it.
      </p>

      <a
        href="https://github.com/tinkrkit/tinkrkit/tree/main/content/blog"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        Open /content/blog on GitHub
      </a>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">MDX frontmatter template</p>
          <button
            onClick={copyTemplate}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-foreground leading-relaxed">
          {MDX_TEMPLATE}
        </pre>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const [option, setOption] = useState<"form" | "github">("form");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit a Blog Post</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your knowledge with the TinkrKit community. We review and publish within 48 hours.
          </p>
        </div>

        {/* Option selector */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => setOption("form")}
            className={`rounded-xl border p-5 text-left transition-all ${
              option === "form"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <p className="mb-1 text-sm font-semibold text-foreground">📝 Quick Submit</p>
            <p className="text-xs text-muted-foreground">Fill out a form — no GitHub account needed.</p>
          </button>
          <button
            onClick={() => setOption("github")}
            className={`rounded-xl border p-5 text-left transition-all ${
              option === "github"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <p className="mb-1 text-sm font-semibold text-foreground">🐙 GitHub Pull Request</p>
            <p className="text-xs text-muted-foreground">Submit via GitHub for full Markdown control.</p>
          </button>
        </div>

        {/* Active option */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {option === "form" ? <QuickSubmitForm /> : <GitHubOption />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
