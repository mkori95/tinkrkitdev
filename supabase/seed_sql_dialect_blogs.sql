-- TinkrKit Blog — SQL Dialect Converter blog posts
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Safe to run multiple times — ON CONFLICT (slug) DO NOTHING prevents duplicates.

-- ─��� 1. MySQL vs PostgreSQL ────────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'MySQL vs PostgreSQL: SQL Syntax Differences You Need to Know',
  'mysql-vs-postgresql-sql-syntax-differences',
  $content$
# MySQL vs PostgreSQL: SQL Syntax Differences You Need to Know

MySQL and PostgreSQL are the two most popular open-source databases. They both speak SQL — but with enough syntax differences to break your queries when you switch between them. Here is what actually changes.

## The Most Common Differences

### 1. Identifier Quoting

MySQL wraps table and column names in backticks. PostgreSQL uses double quotes.

**MySQL:**
```sql
SELECT `user_id`, `email` FROM `users`;
```

**PostgreSQL:**
```sql
SELECT "user_id", "email" FROM "users";
```

Standard SQL (and SQLite, BigQuery) use double quotes too — so MySQL is the odd one out here.

---

### 2. Auto-Increment Columns

**MySQL:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);
```

**PostgreSQL:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);
```

PostgreSQL also supports the SQL standard version: `GENERATED ALWAYS AS IDENTITY`.

---

### 3. Boolean Type

MySQL has no true boolean — it uses `TINYINT(1)` where 1 = true and 0 = false:

```sql
is_active TINYINT(1) DEFAULT 1
```

PostgreSQL has a native `BOOLEAN` type:

```sql
is_active BOOLEAN DEFAULT TRUE
```

---

### 4. Insert and Ignore Duplicates

**MySQL:**
```sql
INSERT IGNORE INTO users (email) VALUES ('test@example.com');
```

**PostgreSQL:**
```sql
INSERT INTO users (email) VALUES ('test@example.com')
ON CONFLICT DO NOTHING;
```

PostgreSQL's `ON CONFLICT` is more powerful — you can also do upserts:

```sql
INSERT INTO users (email, name) VALUES ('test@example.com', 'Mani')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```

---

### 5. String Functions

| Function | MySQL | PostgreSQL |
|---|---|---|
| Concatenate | `CONCAT(a, b)` | `a || b` |
| Null fallback | `IFNULL(val, 0)` | `COALESCE(val, 0)` |
| String aggregate | `GROUP_CONCAT(col)` | `STRING_AGG(col, ',')` |
| Case-insensitive LIKE | `LIKE` (case-insensitive by default on utf8) | `ILIKE` |

---

### 6. Current Timestamp

Both MySQL and PostgreSQL support `NOW()` and `CURRENT_TIMESTAMP`.

SQL Server uses `GETDATE()`. SQLite uses `datetime('now')`.

---

### 7. LIMIT Syntax

MySQL, PostgreSQL, SQLite, and BigQuery all use `LIMIT`:

```sql
SELECT * FROM users LIMIT 10 OFFSET 20;
```

SQL Server is the exception — it uses `TOP`:

```sql
SELECT TOP 10 * FROM users;
```

---

## Quick Reference Table

| Feature | MySQL | PostgreSQL |
|---|---|---|
| Identifiers | backticks | double quotes |
| Auto-increment | `INT AUTO_INCREMENT` | `SERIAL` |
| Boolean | `TINYINT(1)` | `BOOLEAN` |
| Skip duplicates | `INSERT IGNORE` | `ON CONFLICT DO NOTHING` |
| Null fallback | `IFNULL()` | `COALESCE()` |
| String concat | `CONCAT(a, b)` | `a || b` |
| Case-insensitive match | `LIKE` | `ILIKE` |
| Limit rows | `LIMIT n` | `LIMIT n` |

---

## Convert Your SQL Instantly

Migrating from MySQL to PostgreSQL (or any direction)? Use our free [SQL Dialect Converter](/developer/sql-dialect-converter) to transform your queries automatically. Supports MySQL, PostgreSQL, SQLite, SQL Server, and BigQuery. Paste your query, pick your target database, and get a converted query in seconds. No login. No upload. 100% browser-based.
$content$,
  'A practical breakdown of MySQL vs PostgreSQL syntax differences — identifiers, auto-increment, booleans, upserts, string functions, and more. With a free online SQL dialect converter.',
  ARRAY['sql', 'mysql', 'postgresql', 'database migration', 'sql dialect', 'developer tools'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/sql-dialect-converter',
  'approved',
  '2026-07-18T00:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;


-- ── 2. SQL Dialect Cheat Sheet ────────────────────────────────────────────────

INSERT INTO blog_posts (
  title, slug, content, description, tags,
  author_name, author_email, related_tool,
  status, published_at
) VALUES (
  'SQL Dialect Cheat Sheet: MySQL, PostgreSQL, SQLite, SQL Server and BigQuery',
  'sql-dialect-cheat-sheet',
  $content$
# SQL Dialect Cheat Sheet: MySQL, PostgreSQL, SQLite, SQL Server and BigQuery

Every major database speaks SQL — but each has its own dialect. This cheat sheet covers the most common syntax differences across all five major databases so you can write the right query the first time.

## Identifier Quoting

| Database | Style | Example |
|---|---|---|
| MySQL / MariaDB | Backticks | `users` |
| PostgreSQL | Double quotes | "users" |
| SQLite | Double quotes or backticks | "users" |
| SQL Server | Square brackets | [users] |
| BigQuery | Backticks | `project.dataset.users` |

---

## Auto-Increment / Identity Columns

```sql
-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY

-- PostgreSQL
id SERIAL PRIMARY KEY

-- SQLite
id INTEGER PRIMARY KEY

-- SQL Server
id INT IDENTITY(1,1) PRIMARY KEY

-- BigQuery
id STRING DEFAULT (GENERATE_UUID())
```

---

## Boolean Type

```sql
-- MySQL
is_active TINYINT(1) DEFAULT 1

-- PostgreSQL
is_active BOOLEAN DEFAULT TRUE

-- SQLite
is_active INTEGER DEFAULT 1

-- SQL Server
is_active BIT DEFAULT 1

-- BigQuery
is_active BOOL DEFAULT TRUE
```

---

## NULL Fallback Functions

```sql
-- MySQL + SQLite
IFNULL(column, 'default')

-- SQL Server
ISNULL(column, 'default')

-- PostgreSQL + BigQuery + Standard SQL
COALESCE(column, 'default')
```

`COALESCE` works across all databases and accepts multiple arguments — use it when writing portable SQL.

---

## String Concatenation

```sql
-- MySQL + SQL Server
CONCAT(first_name, ' ', last_name)

-- PostgreSQL + SQLite + BigQuery
first_name || ' ' || last_name
```

---

## Current Timestamp

```sql
-- MySQL + PostgreSQL + BigQuery
NOW()

-- SQL Server
GETDATE()

-- SQLite
datetime('now')
```

---

## Skip Duplicate Inserts

```sql
-- MySQL
INSERT IGNORE INTO users (email) VALUES ('a@b.com');

-- PostgreSQL
INSERT INTO users (email) VALUES ('a@b.com')
ON CONFLICT DO NOTHING;

-- SQLite
INSERT OR IGNORE INTO users (email) VALUES ('a@b.com');

-- SQL Server
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'a@b.com')
  INSERT INTO users (email) VALUES ('a@b.com');

-- BigQuery (MERGE)
MERGE users AS target
USING (SELECT 'a@b.com' AS email) AS source
ON target.email = source.email
WHEN NOT MATCHED THEN INSERT (email) VALUES (source.email);
```

---

## LIMIT and Pagination

```sql
-- MySQL + PostgreSQL + SQLite + BigQuery
SELECT * FROM users LIMIT 10 OFFSET 20;

-- SQL Server
SELECT TOP 10 * FROM users;

-- SQL Server with offset (2012+)
SELECT * FROM users
ORDER BY id
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
```

---

## String Aggregation

```sql
-- MySQL
GROUP_CONCAT(tag ORDER BY tag SEPARATOR ', ')

-- PostgreSQL + BigQuery
STRING_AGG(tag, ', ' ORDER BY tag)

-- SQL Server
STRING_AGG(tag, ', ') WITHIN GROUP (ORDER BY tag)

-- SQLite
GROUP_CONCAT(tag, ', ')
```

---

## Case-Insensitive Matching

```sql
-- MySQL (utf8 collation is case-insensitive by default)
WHERE name LIKE 'mani%'

-- PostgreSQL
WHERE name ILIKE 'mani%'

-- SQLite (case-insensitive for ASCII only)
WHERE name LIKE 'mani%'

-- SQL Server (depends on collation — usually case-insensitive by default)
WHERE name LIKE 'mani%'

-- BigQuery (case-sensitive by default)
WHERE LOWER(name) LIKE 'mani%'
```

---

## Data Types Quick Reference

| Concept | MySQL | PostgreSQL | SQLite | SQL Server | BigQuery |
|---|---|---|---|---|---|
| Integer | `INT` | `INT` | `INTEGER` | `INT` | `INT64` |
| Large text | `TEXT` | `TEXT` | `TEXT` | `NVARCHAR(MAX)` | `STRING` |
| Variable string | `VARCHAR(n)` | `VARCHAR(n)` | `TEXT` | `NVARCHAR(n)` | `STRING` |
| Decimal | `DECIMAL(p,s)` | `NUMERIC(p,s)` | `REAL` | `DECIMAL(p,s)` | `NUMERIC` |
| Date and time | `DATETIME` | `TIMESTAMP` | `TEXT` | `DATETIME` | `TIMESTAMP` |
| UUID | `VARCHAR(36)` | `UUID` | `TEXT` | `UNIQUEIDENTIFIER` | `STRING` |

---

## Convert Your SQL Automatically

Do not convert manually — use our free [SQL Dialect Converter](/developer/sql-dialect-converter). Paste your query, choose your source and target database, and get a converted query instantly. Supports MySQL, PostgreSQL, SQLite, SQL Server, and BigQuery. No login. No server. 100% browser-based.
$content$,
  'A complete SQL dialect cheat sheet comparing MySQL, PostgreSQL, SQLite, SQL Server, and BigQuery — identifiers, data types, upserts, pagination, string functions, and more.',
  ARRAY['sql', 'sql cheat sheet', 'mysql', 'postgresql', 'sqlite', 'sql server', 'bigquery', 'database', 'developer tools'],
  'TinkrKit Team',
  'hello@tinkrkit.dev',
  '/developer/sql-dialect-converter',
  'approved',
  '2026-07-18T01:00:00+00:00'
) ON CONFLICT (slug) DO NOTHING;


-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT slug, title, status, published_at
FROM blog_posts
WHERE slug IN (
  'mysql-vs-postgresql-sql-syntax-differences',
  'sql-dialect-cheat-sheet'
)
ORDER BY published_at;
