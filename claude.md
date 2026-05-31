# tinkrkit.dev — Claude Code Context

## What This Is
Free, beautiful, browser-based universal toolkit website.
No backend. No auth. No database. Everything client-side.
Think iLovePDF but for everything — dev tools, image tools, PDF tools, file converters.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui components (v3-compatible, hand-written — NOT shadcn v4)
- Browser-side JS libraries only
- Vercel deployment (pending)

## Architecture Rules
- ZERO backend — all logic runs in the browser
- ZERO API calls for tools — use JS libraries only
- Each tool = its own page and URL
- Privacy first — no user data stored anywhere
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
- [x] `lib/blog.ts` + `lib/blog-data.ts` — MDX blog system (server + client-safe)
- [x] `lib/supabase.ts` — Supabase client; `supabase` (anon key, browser-safe) + `createAdminSupabase()` (service role, server-only); `DBPost` + `UnifiedPost` types
- [x] `lib/auth-options.ts` — NextAuth config; Google provider only; `signIn` callback blocks non-ADMIN_EMAIL; JWT session strategy
- [x] `robots.txt`
- [x] `public/tinkrkit-icon.png` — favicon (referenced in app/layout.tsx metadata only)
- [x] `public/tinkrkit-og.png` — Open Graph image (referenced in app/layout.tsx metadata only)

### Components
- [x] `Logo.tsx` — **Single source of truth for rendered logo.** Pure JSX, no image files.
  - `<Logo size="md" />` in Navbar, `<Logo size="sm" />` in Footer
  - Indigo `rounded-lg` box + inline SVG wrench (white stroke) + `text-foreground` "Tinkr" + `text-indigo-500` "Kit"
  - Works in light AND dark mode without any theme detection
  - **Do NOT add img/png logo references to any rendered component**
- [x] `Navbar.tsx` — Logo (JSX) · Side Layout toggle (homepage only) · Blog · About · 🧩 Add to Chrome · 🌙
  - `AddToChrome` component: outlined indigo pill → modal with email waitlist → saves to localStorage
- [x] `Footer.tsx` — Support strip (social icons + ☕) · Full tools directory (6 categories × all tools) · Chrome extension teaser · Logo (JSX) · legal links
- [x] `ToolLayout.tsx` — wraps every tool page; auto-renders after children: SocialShare → BuyMeCoffee → HowToUse → KeywordTags → RelatedTools → RelatedPosts → AdSlot
- [x] `SocialShare.tsx` — variants: `tool` | `footer` | `homepage`
- [x] `BuyMeCoffee.tsx` — variants: `inline` | `footer` (links to https://buymeacoffee.com/tinkrkit)
- [x] `HowToUse.tsx` — auto-generates 3 steps from `tool.category`; can pass custom `steps` prop
- [x] `InputArea.tsx`, `HighlightedOutput.tsx`, `ComingSoon.tsx`, `ToolHeader.tsx`, `AdSlot.tsx`
- [x] `KeywordTags.tsx`, `RelatedTools.tsx`, `RelatedPosts.tsx`
- [x] `DarkModeToggle.tsx`, `ThemeProvider.tsx`, `CategoryPage.tsx`
- [x] `BlogListing.tsx` — "use client"; receives `posts: UnifiedPost[]` + `allTags` from server; client-side search, tag filter pills, sort (latest/oldest/relevant), 10-per-page pagination

### Auth & Admin
- [x] `middleware.ts` — Edge Runtime; protects `/admin/*`; redirects unauthenticated to `/admin/login`; redirects already-authenticated away from login
- [x] `app/api/auth/[...nextauth]/route.ts` — NextAuth v4 Google OAuth handler
- [x] `app/admin/login/page.tsx` — Google sign-in button; `?error=AccessDenied` message; Suspense wrapper
- [x] `app/admin/blog/page.tsx` — "use client"; tabs (Pending/Approved/Rejected with counts); post cards with Preview/Approve/Reject/Unpublish/Reconsider; Preview modal (full rendered markdown); Reject modal (textarea → emails author via Resend)
- [x] `app/api/admin/posts/route.ts` — GET all posts with `?status=` filter; service role key; auth-checked via JWT
- [x] `app/api/admin/posts/[id]/route.ts` — PATCH approve/reject/unpublish/reconsider + GET single post; Resend rejection email; auth-checked
- [x] `supabase/schema.sql` — `blog_posts` table + indexes + RLS (public SELECT approved, public INSERT pending, service role bypasses RLS)

### Pages
- [x] Homepage (`/`) — hero + search + categories + popular tools + adblock banner + Side Layout mode
- [x] About (`/about`) — Buy Me a Coffee + Chrome Extension teaser
- [x] `/contact` — Formspree form (ID `xpwzqjbn` — replace with real ID)
- [x] `/privacy`, `/terms`, `/content-policy`
- [x] Blog listing (`/blog`) — server component merges MDX + Supabase approved posts; passes to `<BlogListing>` client component; search, tag filter, sort, pagination (10/page)
- [x] Blog post (`/blog/[slug]`) — tries MDX first, falls back to Supabase; shows author, read time, tags, social share, related posts, submit-your-post CTA
- [x] Blog submit (`/blog/submit`) — two options: Quick Submit form (title/slug/description/content with live preview/tags/author/email/tool) → inserts to Supabase as `pending`; GitHub PR option with copyable MDX template
- [x] Admin login (`/admin/login`) — Google OAuth only; access denied message for wrong accounts
- [x] Admin blog (`/admin/blog`) — full CRUD for submitted posts with email notifications

### Tools — 64 total, all fully working

#### Developer — 26 tools (`/developer/[slug]`)
Phase 1: json-formatter, json-validator, json-minifier, xml-formatter, xml-to-json, json-to-xml, yaml-formatter, json-to-yaml, csv-viewer, json-to-csv, sql-formatter, markdown-preview
Phase 3: base64, url-encoder, html-encoder, jwt-decoder, regex-tester, uuid-generator, hash-generator, cron-builder, timestamp-converter, color-converter, diff-checker, base-converter, json-schema, html-preview

#### Image — 12 tools (`/image/[slug]`)
image-compressor, jpg-to-png, png-to-jpg, png-to-webp, webp-to-jpg, image-resizer, image-to-base64, base64-to-image, svg-optimizer, image-metadata, **svg-to-png**, **svg-to-jpeg**

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
- [x] `popup.html` — dark theme, 340px × 560px max; header / search / category tabs / tools list / footer
- [x] `popup.css` — system fonts (offline-safe), `#6366F1` accent, custom scrollbar, all layout tokens
- [x] `popup.js` — 64 tools with emoji icons, category tabs (`data-cat`), real-time search, clear button,  
  `chrome.storage.local` persistence (last category), keyboard shortcut `/` → focus search, `Esc` → clear
- [x] `background.js` — **ACTIVE** service worker; registers right-click "Open in TinkrKit" context menu;  
  auto-detects: JSON · JWT · XML · SQL · YAML · CSV · Regex · Unix timestamp · Base64 · Markdown · long text
- [x] `content_script.js` — Phase 2 content bridge (commented out — not yet needed)
- [x] `icons/` — icon16/32/48/128.png (all present)
- [x] `README.md` — load unpacked guide · testing checklist · right-click detection table · Chrome Web Store publishing steps

---

## ⏳ PENDING — Must do before launch

| Item | Where | Notes |
|---|---|---|
| **Run Supabase schema** | Supabase dashboard → SQL Editor | Paste + run `supabase/schema.sql` |
| **Fill SUPABASE_SERVICE_ROLE_KEY** | `.env.local` | Supabase dashboard → Settings → API → service_role |
| **Generate NEXTAUTH_SECRET** | `.env.local` | `openssl rand -base64 32` |
| **Create Google OAuth app** | console.cloud.google.com | See CLAUDE.md Google OAuth section below |
| **Add RESEND_API_KEY** | `.env.local` + Vercel env | resend.com → API Keys; verify tinkrkit.dev domain |
| Deploy to Vercel | — | `vercel --prod`; add all env vars in Vercel dashboard |
| Connect custom domain | Vercel dashboard | tinkrkit.dev |
| Google Analytics | `app/layout.tsx` | Add GA4 tracking ID |
| Generate sitemap.xml | `app/sitemap.ts` | Submit to Google Search Console |
| Formspree setup | `app/contact/page.tsx` | Replace ID `xpwzqjbn` with real ID from formspree.io |
| Google AdSense | `components/AdSlot.tsx` | Replace placeholder with live ad units once approved |
| Update Chrome Store URL | `components/Navbar.tsx` `CHROME_STORE_URL` | Once extension is published, replace search URL with direct listing URL |
| Mobile testing | — | iPhone + Android |
| Lighthouse score | — | Target 90+ |
| Buy Me a Coffee | — | Sign up at buymeacoffee.com/tinkrkit (placeholder URL is live in code) |
| Social media accounts | — | Create @tinkrkit on Twitter/X, LinkedIn, Instagram, Facebook |

## 🔜 NEXT BUILD (Phase 5)

| Tool | Priority |
|---|---|
| QR Code Generator | High |
| Password Generator / Strength Checker | High |
| Meta Tag Generator | Medium |
| OG Image Preview | Medium |
| Robots.txt Generator | Low |
| Sitemap Generator | Low |
| Chrome Extension Phase 2 | Low (activate background.js + content_script.js) |
| Submit extension to Chrome Web Store | Low |
| Blog — expand to 20+ posts | Ongoing |

---

## Google OAuth Setup (for /admin)

```
1. Go to console.cloud.google.com → New project: "TinkrKit"
2. APIs & Services → OAuth consent screen
   - User type: External
   - App name: TinkrKit Admin
   - Add your email as a test user: manirockzzz007@gmail.com
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Name: TinkrKit Web
   - Authorized redirect URIs:
       http://localhost:3000/api/auth/callback/google
       https://tinkrkit.dev/api/auth/callback/google
4. Copy Client ID + Client Secret → add to .env.local:
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
5. Set ADMIN_EMAIL=manirockzzz007@gmail.com (already done in .env.local)
6. Add all env vars to Vercel dashboard before deploying
```

## Auth Architecture Notes

### NextAuth v4 (IMPORTANT)
- Config: `lib/auth-options.ts`
- Route handler: `app/api/auth/[...nextauth]/route.ts`
- `signIn` callback returns false for any email ≠ `ADMIN_EMAIL` — no session ever created
- JWT session strategy — sessions stored in cookies, not DB
- `NEXTAUTH_SECRET` MUST be set or JWT decoding fails in middleware

### Supabase
- `lib/supabase.ts` exports two clients:
  - `supabase` (anon key) — safe for browser, use in "use client" components
  - `createAdminSupabase()` (service role) — server-only, call only in API routes
- RLS enforced: anon key can only SELECT approved + INSERT pending
- Service role bypasses RLS — used by `/api/admin/*` routes only

### Admin flow
1. Visit `/admin/blog` → middleware checks JWT → redirects to `/admin/login` if no session
2. Click "Sign in with Google" → Google OAuth → `signIn` callback checks email
3. Wrong email → AccessDenied → `/admin/login?error=AccessDenied`
4. Correct email → JWT token created → redirect to `/admin/blog`

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

### Webpack cache fix
- `next.config.mjs` sets `config.cache = { type: 'memory' }` in dev
- `package.json` `dev` script: `rm -rf .next && next dev`
- Together these permanently prevent `ENOENT .pack.gz` errors

### dev script vs restart.sh
- `npm run dev` — self-healing, always clears `.next` first. Use this for normal development.
- `./restart.sh` — use when a dev server is already running and needs to be killed first
- `./restart.sh --hard` — also clears `node_modules/.cache` (rarely needed)

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
1. SocialShare (tool variant) — share buttons
2. BuyMeCoffee (inline variant) — ☕ yellow button
3. HowToUse — 3 auto-generated steps from `tool.category`
4. KeywordTags
5. RelatedTools (4 cards)
6. RelatedPosts
7. AdSlot (mobile below, desktop sidebar)

Custom howToSteps override: `<ToolLayout howToSteps={["step 1", "step 2", "step 3"]}>`

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
