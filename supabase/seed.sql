-- TinkrKit Blog — seed.sql
-- Migrates the 5 existing MDX blog posts into Supabase as approved posts.
--
-- How to run:
--   Supabase Dashboard → SQL Editor → New query → paste this file → Run
--
-- Safe to run multiple times — ON CONFLICT (slug) DO NOTHING prevents duplicates.

-- ── 1. What is JSON? ─────────────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'What is JSON? Complete Guide + Free Online Formatter',
  'what-is-json-complete-guide',
  $content$
# What is JSON? Complete Guide + Free Online Formatter

JSON (JavaScript Object Notation) is a lightweight data format used to store and exchange information between systems. If you've ever built a web app, called an API, or opened a config file — you've used JSON.

## What Does JSON Look Like?

Here's a simple example:

```json
{
  "name": "Mani",
  "age": 29,
  "city": "Atlanta",
  "skills": ["JavaScript", "Swift", "Python"]
}
```

Clean, readable, and universally understood by every programming language.

## Why Does Formatting Matter?

Raw JSON from an API often looks like this:

```json
{"name":"Mani","age":29,"city":"Atlanta","skills":["JavaScript","Swift","Python"]}
```

One long line. Hard to read, hard to debug. Formatting it adds proper indentation so you can instantly see the structure.

## JSON Rules to Know

- Keys must be in double quotes
- Values can be strings, numbers, booleans, arrays, objects, or null
- No trailing commas
- No comments allowed

## Common JSON Errors

- **Missing comma** between key-value pairs
- **Trailing comma** after the last item
- **Single quotes** instead of double quotes
- **Unquoted keys** — `{name: "Mani"}` is invalid

## Format Your JSON Instantly

Stop squinting at minified JSON. Use our free [JSON Formatter](/developer/json-formatter) to beautify, validate, and fix your JSON in one click. No login. No upload to servers. 100% browser-based.

**Paste your JSON → Click Format → Done.**
$content$,
  'Learn what JSON is, why it matters, and how to format it instantly with our free online JSON formatter.',
  ARRAY['json', 'formatter', 'developer tools', 'beginner'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/json-formatter',
  'approved',
  '2026-05-28T00:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ── 2. JSON vs XML ───────────────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'JSON vs XML — Which Format Should You Use in 2026?',
  'json-vs-xml-comparison',
  $content$
# JSON vs XML — Which Format Should You Use in 2026?

Both JSON and XML are data formats used to store and transfer information. But they have very different strengths. Here's when to use each.

## Side by Side Comparison

The same data in both formats:

**JSON:**
```json
{
  "user": {
    "name": "Mani",
    "age": 29,
    "city": "Atlanta"
  }
}
```

**XML:**
```xml
<user>
  <name>Mani</name>
  <age>29</age>
  <city>Atlanta</city>
</user>
```

Same data. JSON is shorter and easier to read.

## Key Differences

| Feature | JSON | XML |
|---|---|---|
| Readability | High | Medium |
| File size | Smaller | Larger |
| Comments | Not supported | Supported |
| Attributes | No | Yes |
| Browser support | Native | Needs parser |
| Used in | APIs, configs | Enterprise, SOAP |

## When to Use JSON

- REST APIs
- Web app configuration
- Data storage in NoSQL databases
- Communication between frontend and backend

## When to Use XML

- Enterprise systems (SOAP APIs)
- Document formats (Word, SVG)
- When you need metadata and attributes
- Legacy system integration

## The Verdict

**Use JSON by default in 2026.** It's lighter, faster to parse, and supported natively by JavaScript. Only use XML when your system requires it.

## Free Tools for Both

- [JSON Formatter](/developer/json-formatter) — beautify and validate JSON
- [XML Formatter](/developer/xml-formatter) — format and parse XML
- [XML to JSON Converter](/developer/xml-to-json) — convert between formats instantly
$content$,
  'A practical comparison of JSON and XML — when to use each, key differences, and free online tools to work with both.',
  ARRAY['json', 'xml', 'comparison', 'developer tools', 'data formats'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/xml-formatter',
  'approved',
  '2026-05-28T01:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ── 3. YAML Tutorial ─────────────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'YAML Tutorial — Syntax, Examples, and Common Errors',
  'yaml-tutorial-syntax-examples',
  $content$
# YAML Tutorial — Syntax, Examples, and Common Errors

YAML (YAML Ain't Markup Language) is a human-readable data format used mostly for configuration files. If you've worked with Docker, Kubernetes, GitHub Actions, or any CI/CD tool — you've written YAML.

## Basic YAML Syntax

```yaml
name: Mani
age: 29
city: Atlanta
skills:
  - JavaScript
  - Swift
  - Python
active: true
```

No curly braces. No quotes needed for simple strings. Indentation defines structure.

## YAML Data Types

```yaml
# String
name: tinkrkit.dev

# Number
version: 1.0

# Boolean
enabled: true

# Null
value: null

# List
tools:
  - JSON
  - XML
  - YAML

# Nested object
database:
  host: localhost
  port: 5432
```

## Most Common YAML Errors

### 1. Wrong indentation
YAML uses spaces — never tabs. Mixing them breaks everything.

```yaml
# Wrong
parent:
	child: value  # tab used here — INVALID

# Correct
parent:
  child: value  # 2 spaces — valid
```

### 2. Missing space after colon
```yaml
# Wrong
name:Mani

# Correct
name: Mani
```

### 3. Unquoted special characters
```yaml
# Wrong — colon in value breaks parsing
message: Hello: World

# Correct
message: "Hello: World"
```

## YAML vs JSON

YAML is a superset of JSON — valid JSON is valid YAML. But YAML is more readable for config files and supports comments (JSON doesn't).

## Validate Your YAML Instantly

Use our free [YAML Formatter and Validator](/developer/yaml-formatter) to check your YAML for errors, format it cleanly, and convert it to JSON. No login required. 100% browser-based.
$content$,
  'Learn YAML syntax with real examples, understand common errors, and validate your YAML files instantly for free.',
  ARRAY['yaml', 'tutorial', 'developer tools', 'config', 'devops'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/yaml-formatter',
  'approved',
  '2026-05-28T02:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ── 4. SQL Formatting Best Practices ─────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'SQL Formatting Best Practices for Clean, Readable Queries',
  'sql-formatting-best-practices',
  $content$
# SQL Formatting Best Practices for Clean, Readable Queries

Unformatted SQL is a nightmare to debug, review, or hand off to another developer. Good formatting makes queries readable at a glance.

## Before and After

**Unformatted:**
```sql
select u.id,u.name,u.email,o.total from users u inner join orders o on u.id=o.user_id where o.total>100 and u.active=true order by o.total desc limit 10
```

**Formatted:**
```sql
SELECT
  u.id,
  u.name,
  u.email,
  o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE
  o.total > 100
  AND u.active = true
ORDER BY o.total DESC
LIMIT 10;
```

Same query. The formatted version is instantly readable.

## Key Formatting Rules

### 1. Uppercase keywords
`SELECT`, `FROM`, `WHERE`, `JOIN`, `ORDER BY` — always uppercase. Column and table names lowercase or as-is.

### 2. One clause per line
Each major clause (`SELECT`, `FROM`, `WHERE`, `JOIN`) starts on a new line.

### 3. Indent columns and conditions
List selected columns indented under `SELECT`. List `WHERE` conditions indented and aligned.

### 4. Align JOIN conditions
```sql
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN products p ON o.product_id = p.id
```

### 5. Always end with a semicolon
Especially important when running multiple queries.

## Common SQL Formatting Mistakes

- Mixing uppercase and lowercase keywords (`Select`, `select`, `SELECT`)
- Everything on one line — impossible to read
- No spaces around operators (`u.id=o.user_id` vs `u.id = o.user_id`)
- Missing aliases on joined tables

## Format Your SQL Instantly

Stop manually formatting SQL. Use our free [SQL Formatter](/developer/sql-formatter) to beautify any SQL query instantly. Supports MySQL, PostgreSQL, SQLite, and more. No login required.
$content$,
  'Learn SQL formatting best practices with examples, and format your SQL queries instantly with our free online SQL formatter.',
  ARRAY['sql', 'formatting', 'database', 'developer tools', 'best practices'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/sql-formatter',
  'approved',
  '2026-05-28T03:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ── 5. How to Compress Images ─────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'How to Compress Images Without Losing Quality (Free Online Tool)',
  'how-to-compress-images-without-losing-quality',
  $content$
# How to Compress Images Without Losing Quality

Large images slow down websites, eat mobile data, and take forever to upload. Compressing them fixes all three — without visibly affecting quality.

## Why Image Size Matters

- A 5MB homepage image makes your site load 3x slower
- Google penalizes slow sites in search rankings
- Mobile users on 4G notice every extra second

## Lossy vs Lossless Compression

**Lossy compression** removes some image data permanently. The result is a smaller file with slightly reduced quality — usually unnoticeable to the human eye. JPG uses lossy compression.

**Lossless compression** reduces file size without removing any data. Quality is identical to the original. PNG uses lossless compression.

## Best Image Format by Use Case

| Use Case | Best Format |
|---|---|
| Photos | JPG or WebP |
| Screenshots | PNG or WebP |
| Logos with transparency | PNG |
| Web images (best all-round) | WebP |
| Animations | WebP or GIF |

## WebP — The Modern Choice

WebP is Google's image format. It's:
- 25–35% smaller than JPG at the same quality
- 26% smaller than PNG
- Supported by all modern browsers

**Converting your images to WebP is the single biggest win for web performance.**

## How Much Can You Compress?

Typical results:
- JPG photo (3MB) → compressed JPG (800KB) — 73% reduction
- PNG screenshot (2MB) → WebP (400KB) — 80% reduction
- Logo PNG (500KB) → compressed PNG (120KB) — 76% reduction

## Compress Your Images for Free

Use our [Image Compressor](/image/image-compressor) to compress JPG, PNG, and WebP images instantly. Your images never leave your browser — 100% private, 100% free.

Supports batch compression, format conversion, and custom quality settings.
$content$,
  'Learn how image compression works and compress your JPG, PNG, and WebP images for free — no upload to servers required.',
  ARRAY['image compression', 'optimize images', 'webp', 'png', 'jpg', 'free tool'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/image/image-compressor',
  'approved',
  '2026-05-28T04:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- After running, confirm with:
-- SELECT slug, title, status, published_at FROM blog_posts ORDER BY published_at;
