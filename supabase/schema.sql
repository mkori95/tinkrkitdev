-- TinkrKit Blog — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- ── Table ──────────────────────────────────────────────────────────────────────

create table if not exists blog_posts (
  id             uuid default gen_random_uuid() primary key,
  title          text not null,
  slug           text unique not null,
  content        text not null,
  description    text,
  tags           text[] default '{}',
  author_name    text not null,
  author_email   text not null,
  related_tool   text,             -- e.g. "/developer/json-formatter"
  status         text default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at     timestamptz default now(),
  published_at   timestamptz
);

-- ── Indexes ────────────────────────────────────────────────────────────────────

create index if not exists blog_posts_status_idx on blog_posts(status);
create index if not exists blog_posts_slug_idx   on blog_posts(slug);
create index if not exists blog_posts_tags_idx   on blog_posts using gin(tags);

-- ── Row Level Security ─────────────────────────────────────────────────────────

alter table blog_posts enable row level security;

-- Anyone can read approved posts
create policy "Public read approved posts"
  on blog_posts for select
  using (status = 'approved');

-- Anyone can submit (insert) a new pending post
-- WITH CHECK prevents status from being set to anything other than 'pending' on insert
create policy "Public submit pending posts"
  on blog_posts for insert
  with check (status = 'pending');

-- Service role key bypasses RLS automatically — used by admin API routes only.
-- No additional policies needed for admin operations.
