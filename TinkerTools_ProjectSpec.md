# 🛠️ tinkrkit.dev — Project Specification
> *One site. Every tool. No nonsense.*

---

## What Is This

tinkrkit.dev is a free, fast, beautiful online toolkit website. No login. No backend. No cost to run. Every tool runs entirely in the browser. Think iLovePDF — but for everything.

PDF tools. Developer tools. Image tools. File converters. All in one place. Clean UI. AdSense funded.

---

## Who It's For

- **Developers** — JSON, YAML, XML, SQL, Regex, Base64 daily use
- **Designers** — Image compression, conversion, color tools
- **Everyday users** — PDF tools, file converters, unit converters
- **Students** — Markdown preview, text tools, calculators

---

## Core Principles

- **Zero backend** — everything runs client-side in the browser
- **Zero auth** — no login, no signup, ever
- **Zero cost** — free to run, free to use
- **Privacy first** — no data ever leaves the browser
- **SEO first** — every tool = its own URL = Google traffic
- **Fast** — tools work instantly, no loading spinners
- **Beautiful** — clean, minimal, modern UI

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | Next.js 14 (App Router) | Free |
| Styling | Tailwind CSS | Free |
| Components | shadcn/ui | Free |
| Tool Logic | Browser-side JS libraries | Free |
| Hosting | Vercel (free tier) | Free |
| Analytics | Google Analytics | Free |
| Ads | Google AdSense | Free (pays you) |
| Domain | tinkrkit.dev | ~$15/year |
| AI (Phase 4) | Claude API | Pay per use |
| **Total** | | **~$0/month** |

### JS Libraries Installed (All Browser-Side)

| Library | Used For |
|---|---|
| js-yaml | YAML parsing + validation |
| fast-xml-parser | XML parsing + formatting |
| papaparse | CSV parsing + conversion |
| marked | Markdown preview |
| sql-formatter | SQL formatting |
| browser-image-compression | Image compression |
| next-mdx-remote | MDX blog rendering |
| gray-matter | MDX frontmatter parsing |
| remark-gfm | GFM tables in MDX |
| exifr | EXIF/metadata reading from images |
| diff | Text diff comparison |
| crypto-js | MD5, SHA1, SHA256, SHA512 hashing |
| cronstrue | Cron expression → human-readable description |
| heic2any | HEIC/HEIF → JPG/PNG decoding (browser-side, dynamic import) |

---

## Monetization

- **Google AdSense** — sidebar ads (desktop) + below output (mobile)
- **Never inside tool input/output area**
- **Never blocking tool usage on mobile**
- AdSlot placeholder components are live and positioned; awaiting AdSense approval

### AdSense Revenue Projection

| Monthly Visitors | RPM | Monthly Revenue |
|---|---|---|
| 10,000 | $8–12 | $80–120 |
| 100,000 | $8–12 | $800–1,200 |
| 500,000 | $8–12 | $4,000–6,000 |
| 1M+ | $8–12 | $8,000–12,000+ |

---

## Site Structure

```
/ (Homepage)
  — Search bar
  — Tool categories grid
  — Most popular tools
  — Side Layout mode (toggle in navbar, persisted to localStorage)

/[category]/[tool-name]   e.g. /developer/json-formatter, /image/image-compressor

/blog              ← Supabase primary + MDX fallback (5 posts live)
/blog/[slug]       ← Individual blog post (Supabase first, MDX fallback)
/blog/submit       ← Quick Submit form + GitHub PR option
/about
/contact           ← Next.js API route (/api/contact) via Resend → support@tinkrkit.dev
/admin/login       ← Google OAuth (NextAuth v4, ADMIN_EMAIL guarded)
/admin/blog        ← Full CRUD — pending/approve/reject with Resend rejection emails
/content-policy
/privacy
/terms
/sitemap.xml       ← ✅ live via app/sitemap.ts (68 tools + blog posts, hourly revalidation)
```

---

## SEO Strategy

- Each tool URL targets exact-match search keywords
- Meta title: `[Tool Name] Online — Free & Instant | tinkrkit.dev`
- H1: exact search phrase
- robots.txt — ✅ live (via `app/robots.ts` Next.js Metadata API)
- sitemap.xml — ✅ live (via `app/sitemap.ts` — 64 tools + blog, hourly revalidation)
- Blog posts targeting top tool keywords — ✅ 5 posts live
- Related Tools + Related Posts + Keyword Tags on every tool page — ✅

---

# 📦 Phase-by-Phase Build Status

---

## ✅ Phase 1 — Foundation + Developer Tools — COMPLETE

### Infrastructure ✅
- [x] Next.js 14 + Tailwind CSS + shadcn/ui (v3-compatible)
- [x] `next.config.mjs` — webpack memory cache in dev (fixes ENOENT .pack.gz errors permanently)
- [x] `package.json` dev script — `rm -rf .next && next dev` (self-healing)
- [x] Dark/light mode (custom ThemeProvider — NOT next-themes)
- [x] `Logo.tsx` — pure JSX logo, no image files (Navbar + Footer), light+dark compatible
- [x] `Navbar.tsx` — JSX logo · Side Layout toggle · Blog · About · 🧩 Add to Chrome (waitlist modal) · 🌙
- [x] `Footer.tsx` — support strip · tools directory (Developer split into 5 sub-groups via `FOOTER_GROUPS`) · Chrome extension teaser · JSX logo; CSS: 2→3→4→5 columns across breakpoints
- [x] Reusable components: ToolLayout, PanelLayout (stacked↔side-by-side toggle, equal-height panels), InputArea, HighlightedOutput (Raw/Tree toggle, syntax highlight), TreeView, ComingSoon, ToolHeader, AdSlot, KeywordTags, RelatedTools, RelatedPosts, SocialShare, BuyMeCoffee, HowToUse
- [x] AdSlot placeholder components (sidebar desktop + below-output mobile)
- [x] `app/robots.ts` — `/robots.txt` via Next.js Metadata API; Disallow: /admin/; links to sitemap
- [x] `app/sitemap.ts` — dynamic `/sitemap.xml`; 64 tool pages (priority 0.8) + homepage (1.0) + blog posts + static pages; fetches Supabase approved posts; revalidates hourly
- [x] `restart.sh` — kills port 3000, clears .next, starts dev
- [x] Homepage — hero + search + categories + popular tools + adblock banner + Side Layout
- [x] Side Layout — sidebar categories + favorites (localStorage-persisted)
- [x] About, Privacy, Terms, Contact, Content Policy pages
- [x] About page — PayPal support button (`paypal.me/tinkrkitdev`) + Chrome Extension teaser
- [x] Blog — Supabase primary + MDX fallback; /blog listing + /blog/[slug]; 5 posts seeded in Supabase
- [x] Blog submit (`/blog/submit`) — Quick Submit form (Supabase anon INSERT) + GitHub PR copyable template
- [x] Admin panel (`/admin/blog`) — Google OAuth (NextAuth v4); pending/approve/reject tabs; preview modal; Resend rejection emails
- [x] `app/api/contact/route.ts` — contact form handler using Resend; FROM: support@tinkrkit.dev; full debug logging
- [x] `supabase/schema.sql` — `blog_posts` table + GIN index on tags + RLS (anon: SELECT approved only, INSERT pending only; service role bypasses all)
- [x] Rebranded to tinkrkit.dev
- [x] Favicon — `app/favicon.ico` (Next.js App Router priority) + `public/favicon-16x16.png` + `public/favicon-32x32.png` + `public/apple-touch-icon.png` — all set to correct tinkrkit icon
- [x] OG image (`tinkrkit-og.png`) in app/layout.tsx metadata
- [ ] Google Analytics ← **pending**
- [ ] Vercel deployment ← **pending**
- [ ] Custom domain live (tinkrkit.dev) ← **pending**

### Developer Tools (Phase 1) — 12/12 ✅

| Tool | URL | Est. Monthly Searches |
|---|---|---|
| JSON Formatter / Beautifier | /developer/json-formatter | 2.2M |
| JSON Validator | /developer/json-validator | 800K |
| JSON Minifier | /developer/json-minifier | 400K |
| XML Formatter | /developer/xml-formatter | 600K |
| XML to JSON | /developer/xml-to-json | 450K |
| JSON to XML | /developer/json-to-xml | 450K |
| YAML Formatter / Validator | /developer/yaml-formatter | 180K |
| JSON to YAML | /developer/json-to-yaml | 220K |
| CSV Viewer / Formatter | /developer/csv-viewer | 300K |
| JSON to CSV | /developer/json-to-csv | 380K |
| SQL Formatter | /developer/sql-formatter | 400K |
| Markdown Preview | /developer/markdown-preview | 250K |

### AdSense
- [x] AdSlot placeholder components built and positioned
- [ ] Apply for Google AdSense
- [ ] Add live ad units once approved

---

## ✅ Phase 2 — Image Tools — COMPLETE (16/16)

| Tool | URL | Status |
|---|---|---|
| Image Compressor | /image/image-compressor | ✅ Built |
| JPG to PNG | /image/jpg-to-png | ✅ Built |
| PNG to JPG | /image/png-to-jpg | ✅ Built |
| PNG to WebP | /image/png-to-webp | ✅ Built |
| WebP to JPG | /image/webp-to-jpg | ✅ Built |
| Image Resizer | /image/image-resizer | ✅ Built |
| Image to Base64 | /image/image-to-base64 | ✅ Built |
| Base64 to Image | /image/base64-to-image | ✅ Built |
| SVG Optimizer | /image/svg-optimizer | ✅ Built |
| Image Metadata Viewer | /image/image-metadata | ✅ Built |
| SVG to PNG | /image/svg-to-png | ✅ Built |
| SVG to JPEG | /image/svg-to-jpeg | ✅ Built |
| HEIC to JPG | /image/heic-to-jpg | ✅ Built |
| HEIC to PNG | /image/heic-to-png | ✅ Built |
| JPG to HEIC | /image/jpg-to-heic | ✅ Built |
| PNG to HEIC | /image/png-to-heic | ✅ Built |

### PDF Tools — 3/3 ✅

| Tool | URL | Status |
|---|---|---|
| PDF to Text | /pdf/pdf-to-text | ✅ Built |
| PDF Page Counter | /pdf/pdf-page-counter | ✅ Built |
| PDF Metadata Viewer | /pdf/pdf-metadata | ✅ Built |

### File Tools — 5/5 ✅

| Tool | URL | Status |
|---|---|---|
| File Size Converter | /file/file-size-converter | ✅ Built |
| Base64 File Encoder | /file/base64-encoder | ✅ Built |
| File Hash Generator | /file/file-hash | ✅ Built |
| CSV to JSON | /file/csv-to-json | ✅ Built |
| CSV to XML | /file/csv-to-xml | ✅ Built |

---

## ✅ Phase 3 — Dev Utilities + Text + Math — COMPLETE (32/32)

### Developer Utilities — 17/17 ✅

| Tool | URL | Status |
|---|---|---|
| Base64 Encoder / Decoder | /developer/base64 | ✅ Built |
| URL Encoder / Decoder | /developer/url-encoder | ✅ Built |
| HTML Encoder / Decoder | /developer/html-encoder | ✅ Built |
| JWT Decoder | /developer/jwt-decoder | ✅ Built |
| Regex Tester | /developer/regex-tester | ✅ Built |
| UUID Generator | /developer/uuid-generator | ✅ Built |
| Hash Generator (MD5/SHA) | /developer/hash-generator | ✅ Built |
| Cron Expression Builder | /developer/cron-builder | ✅ Built |
| Timestamp Converter | /developer/timestamp-converter | ✅ Built |
| Color Picker / Converter | /developer/color-converter | ✅ Built |
| Diff Checker | /developer/diff-checker | ✅ Built |
| Number Base Converter | /developer/base-converter | ✅ Built |
| JSON Schema Validator | /developer/json-schema | ✅ Built |
| HTML Preview | /developer/html-preview | ✅ Built |
| SQL Dialect Converter | /developer/sql-dialect-converter | ✅ Built |
| Markdown to HTML | /developer/markdown-to-html | ✅ Built |
| HTML to Markdown | /developer/html-to-markdown | ✅ Built |

### Text Tools — 11/11 ✅

| Tool | URL | Status |
|---|---|---|
| Word Counter | /text/word-counter | ✅ Built |
| Character Counter | /text/character-counter | ✅ Built |
| Text Case Converter | /text/case-converter | ✅ Built |
| Lorem Ipsum Generator | /text/lorem-ipsum | ✅ Built |
| Text to Slug | /text/text-to-slug | ✅ Built |
| Remove Duplicate Lines | /text/remove-duplicates | ✅ Built |
| Sort Lines | /text/sort-lines | ✅ Built |
| Text Diff | /text/text-diff | ✅ Built |
| String Reverse | /text/string-reverse | ✅ Built |
| Whitespace Remover | /text/whitespace-remover | ✅ Built |
| Find and Replace | /text/find-replace | ✅ Built |

### Math + Conversion Tools — 7/7 ✅

| Tool | URL | Status |
|---|---|---|
| Unit Converter | /math/unit-converter | ✅ Built |
| Number System Converter | /math/number-converter | ✅ Built |
| Percentage Calculator | /math/percentage-calculator | ✅ Built |
| BMI Calculator | /math/bmi-calculator | ✅ Built |
| Age Calculator | /math/age-calculator | ✅ Built |
| Tip Calculator | /math/tip-calculator | ✅ Built |
| Scientific Calculator | /math/scientific-calculator | ✅ Built |

---

## 🤖 Phase 4 — AI Layer
**When: Only after AdSense revenue > $200/month**

| Feature | Tool |
|---|---|
| Explain this JSON | JSON Formatter |
| Fix my JSON | JSON Validator |
| Explain this Regex | Regex Tester |
| Generate JSON Schema | JSON Formatter |
| SQL Explain | SQL Formatter |
| Fix my YAML | YAML Formatter |
| Summarize this CSV | CSV Viewer |

---

## 🌍 Phase 5 — Scale + Expansion

### More Tools (Planned)
- QR Code Generator
- Password Generator / Strength Checker
- Pomodoro Timer
- Currency Converter (live rates)
- IP / DNS / WHOIS lookup
- Meta Tag Generator
- OG Image Preview
- Robots.txt Generator / Sitemap Generator

### Growth Features
- [x] Search across all tools (homepage)
- [x] Favorite tools (localStorage, Side Layout)
- [ ] Recently used tools (localStorage)
- [ ] Share tool output via URL
- [ ] Tool request form

### SEO Expansion
- [x] Blog — 5 posts live
- [ ] Expand blog to 20+ posts targeting top tool keywords
- [ ] Tool comparison pages

---

## 📊 Current Status at a Glance

| Category | Built | ComingSoon | Total |
|---|---|---|---|
| Developer (Phase 1) | 12 | 0 | 12 |
| Developer Utilities (Phase 3) | 17 | 0 | 17 |
| Image (Phase 2) | 16 | 0 | 16 |
| Text (Phase 3) | 11 | 0 | 11 |
| Math (Phase 3) | 7 | 0 | 7 |
| PDF (Phase 4) | 3 | 0 | 3 |
| File (Phase 4) | 5 | 0 | 5 |
| **Total** | **71** | **0** | **71** |

---

## 📋 Launch Checklist

### ✅ BUILT — Code complete
- [x] 71 fully working browser-based tools (Phases 1–4)
- [x] Chrome Extension v1.0.3 Manifest V3 — popup, search, all 71 tools, context menu; permissions: `storage`, `contextMenus` (`tabs` removed — was causing Web Store rejection)
- [x] Logo — pure JSX component (`Logo.tsx`), no image files in rendered UI
- [x] Navbar — JSX logo · Side Layout · Blog · About · 🧩 Add to Chrome · 🌙
- [x] Footer — 68-tool directory via `FOOTER_GROUPS` (Developer split into 5 sub-groups) · 5-column responsive grid · support strip · Chrome teaser · JSX logo
- [x] Favicon (`tinkrkit-icon.png`) + OG image (`tinkrkit-og.png`) in layout.tsx metadata
- [x] Blog — 5 SEO posts live in `/content/blog/`
- [x] Static pages — About, Privacy, Terms, Contact, Content Policy
- [x] Dark/light mode (custom ThemeProvider)
- [x] Side Layout + Favorites (localStorage)
- [x] AdSlot placeholders positioned (sidebar desktop + below output mobile)
- [x] Social share buttons — every tool page, homepage banner, footer
- [x] Social accounts live — X (`x.com/tinkrkitdev`) · LinkedIn (`linkedin.com/company/tinkrkitdev`) · Facebook (`facebook.com/profile.php?id=61592158346256`) · Instagram (`instagram.com/tinkrkitdev`) — all wired in `SocialShare.tsx` footer variant
- [x] PayPal support button (`paypal.me/tinkrkitdev`) — footer: "Tip via PayPal" (PayPal navy `#003087`) · About page: "Support TinkrKit" (indigo); replaces Buy Me a Coffee
- [x] Twitter Card metadata — `site: "@tinkrkitdev"` + `creator: "@tinkrkitdev"` in `app/layout.tsx`
- [x] How to Use — every tool page (auto-generated from category)
- [x] Ad blocker banner on homepage
- [x] Chrome Extension teaser — footer + About page + Navbar modal
- [x] `app/robots.ts` — `/robots.txt` via Next.js Metadata API
- [x] `app/sitemap.ts` — dynamic sitemap with 68 tools + blog posts, hourly revalidation
- [x] webpack memory cache fix (no more ENOENT .pack.gz errors)
- [x] Self-healing `npm run dev` script
- [x] PanelLayout — stacked ↔ side-by-side toggle on 13 developer tools; equal-height panels via `items-stretch` + `flex flex-col` + `flex-1` fill
- [x] Raw/Tree toggle on: json-formatter, xml-formatter, yaml-formatter, xml-to-json, json-minifier
- [x] Indent selector (2/4 spaces) on: json-formatter, xml-formatter, yaml-formatter, json-to-yaml, json-to-xml
- [x] Supabase blog system — schema, RLS, seed (5 approved posts), admin CRUD API routes
- [x] Admin panel (`/admin/blog`) — Google OAuth, NextAuth v4, approve/reject with Resend emails
- [x] Contact form API (`/api/contact`) — Resend transactional email, full debug logging
- [x] Favicon fixed — `app/favicon.ico` (correct tinkrkit icon, replacing old Vercel icon)

### ⏳ PENDING — Must do before launch
- [ ] **Deploy to Vercel** — `vercel --prod`; add ALL env vars in Vercel dashboard
- [ ] **Connect domain** — tinkrkit.dev in Vercel dashboard
- [ ] **Verify tinkrkit.dev in Resend** — required before contact form FROM address (`support@tinkrkit.dev`) works; verify at resend.com/domains
- [ ] **Google Analytics** — add GA4 `measurementId` to `app/layout.tsx`
- [ ] **Submit sitemap.xml** — submit `tinkrkit.dev/sitemap.xml` to Google Search Console after domain is live (`app/sitemap.ts` is already built)
- [ ] **Google AdSense** — apply after launch, then replace AdSlot placeholders with live ad code
- [ ] **Resubmit Chrome Extension v1.0.3** — repackage `chrome-extension/` as zip (already done: `tinkrkit-extension.zip`) and resubmit to Chrome Web Store (v1.0.3 adds SQL Dialect Converter, Markdown→HTML, HTML→Markdown; 71 tools total)
- [ ] **Mobile testing** — iPhone + Android
- [ ] **Lighthouse** — target 90+ score

### 🔜 NEXT BUILD (Phase 5 — after launch)
- [ ] QR Code Generator (`/developer/qr-generator`)
- [ ] Password Generator + Strength Checker (`/developer/password-generator`)
- [ ] Meta Tag Generator (`/developer/meta-tag-generator`)
- [ ] OG Image Preview (`/developer/og-preview`)
- [ ] Robots.txt Generator (`/developer/robots-generator`)
- [ ] Chrome Extension Phase 2 — activate content_script.js (context menu is already active in background.js)
- [ ] Expand blog to 20+ posts targeting top tool keywords

---

## 🚀 Launch Channels
1. Product Hunt
2. Hacker News — "Show HN: Free all-in-one browser tools"
3. Reddit — r/webdev, r/programming, r/javascript, r/india
4. Twitter/X — developer community
5. LinkedIn

---

## 📁 Folder Structure

```
tinkrkitdev/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root (ThemeProvider + LayoutProvider + metadata)
│   ├── favicon.ico                 # ✅ Correct tinkrkit icon (Next.js App Router priority)
│   ├── sitemap.ts                  # Dynamic /sitemap.xml — 71 tools + blog; hourly revalidation
│   ├── robots.ts                   # /robots.txt via Next.js Metadata API
│   ├── developer/                  # 29 tools (Phase 1 + Phase 3) ✅
│   ├── image/                      # 16 tools (Phase 2 + SVG to PNG/JPEG + 4 HEIC) ✅
│   ├── text/                       # 11 tools (Phase 3) ✅
│   ├── math/                       # 7 tools (Phase 3) ✅
│   ├── pdf/                        # 3 tools (pdfjs-dist@5.7.284) ✅
│   ├── file/                       # 5 tools ✅
│   ├── blog/
│   │   ├── page.tsx                # Blog listing — Supabase + MDX merge; search; tag filter; pagination
│   │   ├── [slug]/page.tsx         # Supabase primary, MDX fallback; social share; related posts
│   │   └── submit/page.tsx         # Quick Submit (Supabase anon INSERT) + GitHub PR option
│   ├── admin/
│   │   ├── login/page.tsx          # Google OAuth sign-in; AccessDenied error banner
│   │   └── blog/page.tsx           # Full CRUD: pending/approve/reject tabs; preview modal; reject email
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth v4 Google OAuth handler
│   │   ├── contact/route.ts        # Contact form → Resend → support@tinkrkit.dev (full debug logging)
│   │   └── admin/
│   │       ├── posts/route.ts      # GET all posts by status (uses getServerSession + service role)
│   │       └── posts/[id]/route.ts # PATCH approve/reject + Resend rejection email
│   ├── about/
│   ├── contact/                    # UI → calls /api/contact (Resend); no Formspree
│   ├── content-policy/
│   ├── privacy/
│   └── terms/
├── chrome-extension/               # Manifest V3 extension — standalone, not part of Next.js build
│   ├── manifest.json               # v1.0.3; permissions: storage, contextMenus (tabs removed); 71 tools
│   ├── popup.html / popup.js / popup.css
│   ├── background.js               # Active service worker; "Open in TinkrKit" context menu; auto-detects 10 formats
│   ├── content_script.js           # Phase 2 content bridge (commented out — not needed yet)
│   ├── icons/                      # icon16/32/48/128.png
│   └── README.md                   # Load unpacked, testing checklist, Web Store publishing guide
├── components/
│   ├── Logo.tsx                    # Shared logo — pure JSX, no image files (Navbar + Footer)
│   ├── ToolLayout.tsx              # Tool wrapper (SocialShare+BuyMeCoffee+HowToUse+tags+related+ads)
│   ├── PanelLayout.tsx             # Input/output panel wrapper — stacked↔side-by-side toggle, equal heights
│   ├── SocialShare.tsx             # variants: tool | footer | homepage
│   ├── BuyMeCoffee.tsx             # variants: inline | footer
│   ├── HowToUse.tsx                # Auto-generates steps from tool.category
│   ├── InputArea.tsx               # File upload + URL load + paste; flex-1 fills panel height
│   ├── HighlightedOutput.tsx       # Syntax highlight + Raw/Tree toggle + copy/download; flex-1 fills panel
│   ├── TreeView.tsx                # Collapsible tree for parsed JSON/XML/YAML values
│   ├── BlogListing.tsx             # Client: search, tag filter pills, sort, 10/page pagination
│   ├── ComingSoon.tsx
│   ├── ToolHeader.tsx
│   ├── AdSlot.tsx
│   ├── KeywordTags.tsx
│   ├── RelatedTools.tsx
│   ├── RelatedPosts.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx                  # Uses FOOTER_GROUPS — Developer split into 5 sub-groups
│   ├── DarkModeToggle.tsx
│   ├── ThemeProvider.tsx           # Custom (NOT next-themes); exports useTheme() → { theme, toggle }
│   └── CategoryPage.tsx
├── contexts/
│   └── LayoutContext.tsx           # Side layout + favorites (localStorage)
├── lib/
│   ├── tools-config.ts             # All 71 tools' metadata (TOOLS array + helpers)
│   ├── supabase.ts                 # anon client (browser-safe) + createAdminSupabase() (service role, server-only)
│   ├── auth-options.ts             # NextAuth v4 config; GoogleProvider; JWT strategy; ADMIN_EMAIL guard
│   ├── blog.ts                     # Server: reads MDX files (fallback only)
│   ├── blog-data.ts                # Client-safe: static post metadata
│   └── utils.ts
├── supabase/
│   ├── schema.sql                  # blog_posts table + GIN index + RLS policies
│   └── seed.sql                    # 5 approved MDX posts (idempotent via ON CONFLICT)
├── content/
│   └── blog/                       # 5 MDX posts (MDX fallback — Supabase is primary)
├── public/
│   ├── favicon.ico                 # Also correct tinkrkit icon
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── tinkrkit-icon.png           # Used in app/layout.tsx metadata
│   └── tinkrkit-og.png             # OG/Twitter social preview image
├── middleware.ts                   # Edge Runtime; protects /admin/*; getToken (correct for Edge)
├── claude.md                       # Claude Code context (full architecture reference)
├── restart.sh                      # ./restart.sh — kills port 3000, clears .next, starts dev
└── package.json
```

*Version: 3.8 — Last Updated: July 2026*
*Status: 71 tools ✅ · SQL Dialect Converter (MySQL/PostgreSQL/SQLite/SQL Server/BigQuery) ✅ · Markdown→HTML ✅ · HTML→Markdown ✅ · 4 HEIC tools ✅ · PanelLayout on 13 dev tools ✅ · Footer 5-column FOOTER_GROUPS ✅ · Chrome Extension v1.0.3 (71 tools) ✅ · Supabase blog + admin panel ✅ · Contact form via Resend ✅ · Sitemap + robots.ts ✅ · PayPal support (paypal.me/tinkrkitdev) ✅ · Social accounts live (@tinkrkitdev) ✅ · Twitter Card metadata ✅ · Deployment pending.*
