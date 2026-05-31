// lib/supabase.ts
// Public client → uses anon key (safe for browser, respects RLS)
// Admin client  → uses service role key (server-only, bypasses RLS)

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Public browser client ─────────────────────────────────────────────────────
// Safe to use in "use client" components. RLS policies apply.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Server-only admin client ──────────────────────────────────────────────────
// Uses service role key — NEVER import in client components.
// Call this in API Route Handlers (app/api/**) only.
export function createAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// ── Database type ─────────────────────────────────────────────────────────────

export interface DBPost {
  id:               string;
  title:            string;
  slug:             string;
  content:          string;
  description:      string | null;
  tags:             string[];
  author_name:      string;
  author_email:     string;
  related_tool:     string | null;
  status:           "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at:       string;
  published_at:     string | null;
}

// ── Unified post card (used across blog listing, search, related posts) ────────

export interface UnifiedPost {
  slug:        string;
  title:       string;
  description: string;
  tags:        string[];
  author:      string;
  date:        string; // ISO date string used for sorting
  source:      "mdx" | "db";
}
