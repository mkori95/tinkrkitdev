# tinkrkit.dev — Claude Code Context

## What This Is
Free, beautiful, browser-based universal toolkit website.
No backend for tools. No auth for users. Everything client-side.
Think iLovePDF but for everything — dev tools, image tools, PDF tools, file converters.
Blog system + admin panel backed by Supabase + Google OAuth.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui components (v3-compatible, hand-written — NOT shadcn v4)
- Browser-side JS libraries only (for tools)
- Supabase (blog posts DB)
- NextAuth v4 (Google OAuth, admin only)
- Resend (rejection emails)
- Vercel deployment (pending)

## Architecture Rules
- ZERO backend for tools — all tool logic runs in the browser
- Each tool = its own page and URL
- Privacy first — no user data stored except blog submissions
- Reuse ToolLayout, InputArea, HighlightedOutput, Logo components on every tool/page
- NEVER return a 404 — every linked URL gets at minimum a ComingSoon page

---

## ✅ BUILT — Complete list

### Infrastructure
- [x] Next.js 14 + Tailwind CSS + shadcn/ui (v3-compatible)
- [x] `next.config.mjs` — webpack memory cache in dev (prevents ENOENT .pack.gz errors)
- [x] `package.json` dev script — `rm -rf .next && next dev` (self-healing, never stale cache)
- [x] `restart.sh` — kills port 3000, clears .next, starts dev server
- [x] Custom ThemeProvider (`components/ThemeProvider.tsx`) — exports `useTheme()` → `{ theme, toggle }`
- [x] `contexts/LayoutContext.tsx` — Side Layout + Favorites (localStorage-persisted)
- [x] `lib/tools-config.ts` — all 64 tools' metadata (TOOLS array + helpers)
- [x] `lib/blog.ts` + `lib/blog-data.ts` — MDX blog system (server + client-safe, now fallback only)
- [x] `lib/supabase.ts` — `supabase` (anon key, browser-safe) + `createAdminSupabase()` (service role, server-only) + `DBPost` / `UnifiedPost` types
- [x] `lib/auth-options.ts` — NextAuth v4 config; Google provider (guarded for missing credentials); `signIn` blocks non-ADMIN_EMAIL; JWT strategy
- [x] `robots.txt` → replaced by `app/robots.ts` (Next.js Metadata API)
- [x] `public/tinkrkit-icon.png` — favicon
- [x] `public/tinkrkit-og.png` — Open Graph image

### Auth & Admin
- [x] `middleware.ts` — Edge Runtime; `getToken` (correct for Edge); protects `/admin/*`; redirects unauthenticated → `/admin/login`; redirects already-authenticated away from login page
- [x] `app/api/auth/[...nextauth]/route.ts` — NextAuth v4 Google OAuth handler
- [x] `app/admin/login/page.tsx` — Google sign-in button; `?error=AccessDenied` banner; Suspense wrapper for `useSearchParams`
- [x] `app/admin/blog/page.tsx` — "use client"; Pending/Approved/Rejected tabs with counts; post cards; Preview modal (full rendered markdown via `marked`); Reject modal (textarea → Resend email); visible error banners for API failures
- [x] `app/api/admin/posts/route.ts` — GET all posts `?status=all|pending|approved|rejected`; **uses `getServerSession`** (correct for App Router); service role Supabase
- [x] `app/api/admin/posts/[id]/route.ts` — PATCH approve/reject/unpublish/reconsider + GET single post; **uses `getServerSession`**; Resend rejection email; full error handling
- [x] `supabase/schema.sql` — `blog_posts` table + GIN index on tags + RLS (anon SELECT approved, anon INSERT pending, service role bypasses)
- [x] `supabase/seed.sql` — inserts 5 MDX blog posts into Supabase as `approved` (idempotent via ON CONFLICT)

### Supabase Blog System
- [x] `app/blog/page.tsx` — Server Component; fetches approved posts from Supabase + MDX; passes to `<BlogListing>`; `force-dynamic` (no cache); logs Supabase errors to console
- [x] `app/blog/[slug]/page.tsx` — **Supabase first**, MDX fallback; `maybeSingle()` (no throw on 0 rows); social share buttons; related posts; read time; submit CTA
- [x] `app/blog/submit/page.tsx` — "use client"; Quick Submit form (title/slug auto-gen/description/content with live preview/tags/author/email/related tool dropdown); GitHub PR option with copyable MDX template; inserts directly to Supabase anon key
- [x] `components/BlogListing.tsx` — "use client"; search, tag filter pills, sort (latest/oldest/relevant), 10-per-page pagination with prev/next

### Sitemap & SEO
- [x] `app/sitemap.ts` — dynamic `/sitemap.xml`; 64 tool pages (priority 0.8), homepage (1.0), blog (0.7), static pages (0.5); fetches Supabase approved posts; revalidates hourly
- [x] `app/robots.ts` — `/robots.txt`; `Disallow: /admin/`; links to sitemap

### Components
- [x] `Logo.tsx` — **Single source of truth.** Pure JSX, no image files. `text-foreground` "Tinkr" + `text-indigo-500` "Kit". Works in light AND dark.
- [x] `Navbar.tsx` — Logo · Side Layout toggle (homepage only) · Blog · About · 🧩 Add to Chrome (→ Chrome Web Store) · 🌙
- [x] `Footer.tsx` — Social strip · Full tools directory · Chrome extension teaser (→ Chrome Web Store) · Logo · legal links
- [x] `ToolLayout.tsx` — wraps every tool; auto-renders: SocialShare → BuyMeCoffee → HowToUse → KeywordTags → RelatedTools → RelatedPosts → AdSlot
- [x] `SocialShare.tsx`, `BuyMeCoffee.tsx`, `HowToUse.tsx`, `KeywordTags.tsx`, `RelatedTools.tsx`, `RelatedPosts.tsx`
- [x] `InputArea.tsx`, `HighlightedOutput.tsx`, `ComingSoon.tsx`, `ToolHeader.tsx`, `AdSlot.tsx`
- [x] `DarkModeToggle.tsx`, `ThemeProvider.tsx`, `CategoryPage.tsx`
- [x] `BlogListing.tsx` — client-side search, tag filter, sort, pagination

### Pages
- [x] Homepage (`/`) — hero + search + categories + popular tools + adblock banner + Side Layout mode
- [x] About (`/about`) — Buy Me a Coffee + Chrome Extension teaser
- [x] `/contact` — Formspree form (ID `xpwzqjbn` — replace with real ID)
- [x] `/privacy`, `/terms`, `/content-policy`
- [x] Blog listing (`/blog`) — Supabase + MDX merge; search; tag filter pills; sort; 10/page pagination
- [x] Blog post (`/blog/[slug]`) — Supabase primary, MDX fallback; read time; author; social share; related posts; submit CTA
- [x] Blog submit (`/blog/submit`) — Quick Submit form + GitHub PR option
- [x] Admin login (`/admin/login`) — Google OAuth only; AccessDenied error message
- [x] Admin blog (`/admin/blog`) — full CRUD; preview modal; reject with email notification

### Tools — 64 total, all fully working

#### Developer — 26 tools (`/developer/[slug]`)
Phase 1: json-formatter, json-validator, json-minifier, xml-formatter, xml-to-json, json-to-xml, yaml-formatter, json-to-yaml, csv-viewer, json-to-csv, sql-formatter, markdown-preview
Phase 3: base64, url-encoder, html-encoder, jwt-decoder, regex-tester, uuid-generator, hash-generator, cron-builder, timestamp-converter, color-converter, diff-checker, base-converter, json-schema, html-preview

#### Image — 12 tools (`/image/[slug]`)
image-compressor, jpg-to-png, png-to-jpg, png-to-webp, webp-to-jpg, image-resizer, image-to-base64, base64-to-image, svg-optimizer, image-metadata, svg-to-png, svg-to-jpeg

#### PDF — 3 tools (`/pdf/[slug]`)
pdf-to-text, pdf-page-counter, pdf-metadata
(uses pdfjs-dist@5.7.284, dynamic import, CDN worker)

#### File — 5 tools (`/file/[slug]`)
file-hash, file-size-converter, csv-to-json, csv-to-xml, base64-encoder

#### Text — 11 tools (`/text/[slug]`)
word-counter, character-counter, case-converter, lorem-ipsum, text-to-slug, remove-duplicates, sort-lines, text-diff, string-reverse, whitespace-remover, find-replace

#### Math — 7 tools (`/math/[slug]`)
unit-converter, number-converter, percentage-calculator, bmi-calculator, age-calculator, tip-calculator, scientific-calculator

### Chrome Extension (`/chrome-extension/` — standalone, not part of Next.js build)
- [x] `manifest.json` — Manifest V3; permissions: `storage`, `tabs`, `contextMenus`; service worker active
- [x] `popup.html` — dark theme, 340×560px max; header / search / category tabs / tools list / footer
- [x] `popup.css` — system fonts (offline-safe), `#6366F1` accent, custom scrollbar
- [x] `popup.js` — 64 tools with emoji icons; category tabs; real-time search + clear button; `chrome.storage.local` persistence; `/` → focus search, `Esc` → clear
- [x] `background.js` — **ACTIVE** service worker; "Open in TinkrKit" context menu; auto-detects JSON · JWT · XML · SQL · YAML · CSV · Regex · Unix timestamp · Base64 · Markdown · long text
- [x] `content_script.js` — Phase 2 bridge (commented out — not needed yet)
- [x] `icons/` — icon16/32/48/128.png (all present)
- [x] `README.md` — load unpacked guide · testing checklist · detection table · Chrome Web Store publishing steps

---

## ⏳ PENDING — Must do before launch

| Priority | Item | Where | Notes |
|---|---|---|---|
| 🔴 High | **Deploy to Vercel** | — | `vercel --prod`; add ALL env vars in Vercel dashboard |
| 🔴 High | **Connect custom domain** | Vercel dashboard | tinkrkit.dev |
| 🔴 High | **Verify tinkrkit.dev in Resend** | resend.com dashboard | Required before rejection emails send from `blog@tinkrkit.dev` |
| 🟡 Medium | **Google Analytics GA4** | `app/layout.tsx` | Add GA4 `measurementId` |
| 🟡 Medium | **Submit sitemap.xml** | Google Search Console | After domain is connected |
| 🟡 Medium | **Formspree setup** | `app/contact/page.tsx` | Replace ID `xpwzqjbn` with real ID from formspree.io |
| 🟡 Medium | **Mobile testing** | — | iPhone + Android |
| 🟡 Medium | **Lighthouse score** | — | Target 90+ |
| 🟢 Low | **Google AdSense** | `components/AdSlot.tsx` | Replace placeholder once approved |
| 🟢 Low | **Buy Me a Coffee** | — | Sign up at buymeacoffee.com/tinkrkit |
| 🟢 Low | **Social media accounts** | — | @tinkrkit on Twitter/X, LinkedIn, Instagram, Facebook |
| 🟢 Low | **Publish Chrome extension** | Chrome Web Store | Then update `CHROME_STORE_URL` in `components/Navbar.tsx` |

---

## 🔜 NEXT BUILD (Phase 5)

| Tool | Priority |
|---|---|
| QR Code Generator | High |
| Password Generator + Strength Checker | High |
| Meta Tag Generator | Medium |
| OG Image Preview | Medium |
| Robots.txt Generator | Low |
| Sitemap Generator | Low |
| Blog — expand to 20+ posts | Ongoing |

---

## Key Architecture Notes

### ThemeProvider (IMPORTANT — NOT next-themes)
- Custom ThemeProvider in `components/ThemeProvider.tsx`
- Exports: `useTheme()` → `{ theme: "light" | "dark", toggle: () => void }`
- **Do NOT import from "next-themes"** — it is NOT installed
- Dark mode applied via `document.documentElement.classList.toggle("dark", ...)`
- Logo uses `text-foreground` (not `text-white`) — adapts to theme without any JS

### Logo (IMPORTANT — pure JSX only)
- `components/Logo.tsx` is the only place the logo is rendered visually
- `public/tinkrkit-*.png` files exist ONLY for: favicon in `<head>`, OG/Twitter meta tags
- Never add `<img src="/tinkrkit-logo-*.png">` to any component

### Add to Chrome button
- `components/Navbar.tsx` → `CHROME_STORE_URL` constant at top of file
- Currently points to `https://chromewebstore.google.com/search/TinkrKit`
- Update to the direct listing URL once the extension is published

### NextAuth v4 (CRITICAL — auth patterns)
- Config: `lib/auth-options.ts` (guarded GoogleProvider, JWT strategy)
- Route handler: `app/api/auth/[...nextauth]/route.ts`
- **Middleware** → uses `getToken` from `next-auth/jwt` (Edge Runtime ✓)
- **API Route Handlers** → uses `getServerSession(authOptions)` (Node.js Runtime ✓)
- **NEVER use `getToken` in App Router route handlers** — use `getServerSession`
- `signIn` callback returns false for any email ≠ `ADMIN_EMAIL`; no session created
- `NEXTAUTH_SECRET` must be set for JWT signing/verification

### Supabase (two clients)
- `supabase` (anon key) — safe for browser; use in "use client" components and Server Components for public reads
- `createAdminSupabase()` (service role) — server-only; call ONLY in `/api/admin/*` route handlers
- RLS: anon key SELECT approved only · anon key INSERT pending only · service role bypasses all RLS
- Blog listing: `force-dynamic` so new approved posts appear without a redeploy

### Blog data flow
```
Submit → Supabase (status: pending)
Admin approves → Supabase (status: approved, published_at: now)
/blog listing → fetches Supabase approved + MDX, merges by date, deduplicates (DB wins on slug tie)
/blog/[slug] → Supabase first (maybeSingle), MDX fallback, 404 if neither
```

### Webpack cache fix
- `next.config.mjs` sets `config.cache = { type: 'memory' }` in dev
- `package.json` `dev` script: `rm -rf .next && next dev`
- Together these permanently prevent `ENOENT .pack.gz` errors

### Component usage pattern
```tsx
"use client";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";

const tool = TOOLS.find(t => t.slug === "json-formatter")!;

export default function Page() {
  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      {/* tool UI */}
    </ToolLayout>
  );
}
```

ToolLayout auto-renders after children (in order):
1. SocialShare (tool variant)
2. BuyMeCoffee (inline variant)
3. HowToUse — 3 auto-generated steps from `tool.category`
4. KeywordTags
5. RelatedTools (4 cards)
6. RelatedPosts
7. AdSlot (mobile below, desktop sidebar)

### PDF tools (pdfjs-dist v5.7.284)
```tsx
const pdfjsLib = await import("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";
const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
// Text: tc.items.filter(i => "str" in i).map(i => (i as any).str)
```

### SVG conversion tools
- DOMParser + XMLSerializer to inject width/height into SVG
- Canvas API renders via `new Image()` with blob URL
- SVG to PNG: no background fill (preserves transparency)
- SVG to JPEG: fills canvas with `bgColor` before drawing (JPEG has no alpha)

### File size limits
- JSON / XML / YAML / SQL / CSV: 5 MB
- Markdown / Text: 2 MB
- Images / PDF / Files: 10 MB
- Base64 file encoder: 5 MB

### Build rules
- shadcn components are v3-compatible — do NOT use shadcn CLI
- Do NOT use `next/image` — use `<img>` with `eslint-disable-next-line @next/next/no-img-element`
- All tool pages must be `"use client"` (they use browser APIs)
- Import `cn` from `"@/lib/utils"` for conditional classNames
- `marked.parse()` returns `string` synchronously (v18, no async option) — `as string` cast is safe

### Google OAuth Setup (for /admin)
```
1. console.cloud.google.com → New project: TinkrKit
2. APIs & Services → OAuth consent screen → External → add manirockzzz007@gmail.com as test user
3. Credentials → Create OAuth Client ID → Web application
   Authorized redirect URIs:
     http://localhost:3000/api/auth/callback/google
     https://tinkrkit.dev/api/auth/callback/google
4. Copy Client ID + Secret → .env.local → GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
5. Add all env vars to Vercel before deploying
```

### Vercel env vars required
All vars from `.env.local` must be added to Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → set to `https://tinkrkit.dev` (not localhost)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL`
- `RESEND_API_KEY`
