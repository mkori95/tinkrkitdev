export type ToolCategory =
  | "developer"
  | "image"
  | "pdf"
  | "file"
  | "text"
  | "math";

export interface Tool {
  name: string;
  slug: string;
  category: ToolCategory;
  url: string;
  description: string;
  keywords: string[];
  popular?: boolean;
}

export const CATEGORIES: {
  id: ToolCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    id: "developer",
    label: "Developer",
    description: "JSON, YAML, XML, SQL, Regex and more",
    icon: "code-2",
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  },
  {
    id: "image",
    label: "Image",
    description: "Compress, convert, resize images",
    icon: "image",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Extract text, count pages, view metadata",
    icon: "file-text",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  {
    id: "file",
    label: "File",
    description: "Hash, encode, convert, inspect files",
    icon: "folder-open",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  {
    id: "text",
    label: "Text",
    description: "Count, convert, transform text",
    icon: "type",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    id: "math",
    label: "Math",
    description: "Calculators and unit converters",
    icon: "calculator",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
];

export const TOOLS: Tool[] = [
  // ─── Developer — Phase 1 ───────────────────────────────────────────────────
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "developer",
    url: "/developer/json-formatter",
    description: "Beautify and format JSON online, instantly",
    keywords: ["json formatter", "json beautifier", "format json", "pretty print json"],
    popular: true,
  },
  {
    name: "JSON Validator",
    slug: "json-validator",
    category: "developer",
    url: "/developer/json-validator",
    description: "Validate JSON syntax and find errors instantly",
    keywords: ["json validator", "validate json", "json lint", "check json"],
    popular: true,
  },
  {
    name: "JSON Minifier",
    slug: "json-minifier",
    category: "developer",
    url: "/developer/json-minifier",
    description: "Minify and compress JSON to reduce size",
    keywords: ["json minifier", "compress json", "minify json", "compact json"],
    popular: true,
  },
  {
    name: "XML Formatter",
    slug: "xml-formatter",
    category: "developer",
    url: "/developer/xml-formatter",
    description: "Format and prettify XML code online",
    keywords: ["xml formatter", "format xml", "xml beautifier", "pretty print xml"],
    popular: true,
  },
  {
    name: "XML to JSON",
    slug: "xml-to-json",
    category: "developer",
    url: "/developer/xml-to-json",
    description: "Convert XML to JSON format online",
    keywords: ["xml to json", "convert xml to json", "xml json converter"],
    popular: true,
  },
  {
    name: "JSON to XML",
    slug: "json-to-xml",
    category: "developer",
    url: "/developer/json-to-xml",
    description: "Convert JSON to XML format online",
    keywords: ["json to xml", "convert json to xml", "json xml converter"],
  },
  {
    name: "YAML Formatter",
    slug: "yaml-formatter",
    category: "developer",
    url: "/developer/yaml-formatter",
    description: "Format and validate YAML online",
    keywords: ["yaml formatter", "yaml validator", "format yaml", "yaml lint"],
    popular: true,
  },
  {
    name: "JSON to YAML",
    slug: "json-to-yaml",
    category: "developer",
    url: "/developer/json-to-yaml",
    description: "Convert JSON to YAML format online",
    keywords: ["json to yaml", "convert json yaml", "json yaml converter"],
  },
  {
    name: "CSV Viewer",
    slug: "csv-viewer",
    category: "developer",
    url: "/developer/csv-viewer",
    description: "View and format CSV files in a table",
    keywords: ["csv viewer", "csv formatter", "view csv", "csv table"],
  },
  {
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "developer",
    url: "/developer/json-to-csv",
    description: "Convert JSON to CSV format online",
    keywords: ["json to csv", "convert json to csv", "json csv converter"],
    popular: true,
  },
  {
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "developer",
    url: "/developer/sql-formatter",
    description: "Format and beautify SQL queries online",
    keywords: ["sql formatter", "format sql", "sql beautifier", "sql pretty print"],
    popular: true,
  },
  {
    name: "Markdown Preview",
    slug: "markdown-preview",
    category: "developer",
    url: "/developer/markdown-preview",
    description: "Preview Markdown with live rendering",
    keywords: ["markdown preview", "markdown viewer", "markdown editor", "md preview"],
  },

  // ─── Developer — Phase 3 ───────────────────────────────────────────────────
  {
    name: "Base64 Encoder / Decoder",
    slug: "base64",
    category: "developer",
    url: "/developer/base64",
    description: "Encode and decode Base64 strings online",
    keywords: ["base64 encoder", "base64 decoder", "encode base64", "decode base64"],
    popular: true,
  },
  {
    name: "URL Encoder / Decoder",
    slug: "url-encoder",
    category: "developer",
    url: "/developer/url-encoder",
    description: "Encode and decode URLs and query strings online",
    keywords: ["url encoder", "url decoder", "encode url", "decode url", "url encode online"],
    popular: true,
  },
  {
    name: "HTML Encoder / Decoder",
    slug: "html-encoder",
    category: "developer",
    url: "/developer/html-encoder",
    description: "Encode and decode HTML entities online",
    keywords: ["html encoder", "html decoder", "html entities", "escape html"],
  },
  {
    name: "JWT Decoder",
    slug: "jwt-decoder",
    category: "developer",
    url: "/developer/jwt-decoder",
    description: "Decode and inspect JWT tokens without a secret",
    keywords: ["jwt decoder", "decode jwt", "jwt parser", "json web token decoder"],
    popular: true,
  },
  {
    name: "Regex Tester",
    slug: "regex-tester",
    category: "developer",
    url: "/developer/regex-tester",
    description: "Test and debug regular expressions with live match highlighting",
    keywords: ["regex tester", "regex validator", "regular expression tester", "regex online"],
    popular: true,
  },
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "developer",
    url: "/developer/uuid-generator",
    description: "Generate random UUIDs / GUIDs instantly online",
    keywords: ["uuid generator", "guid generator", "random uuid", "generate uuid"],
    popular: true,
  },
  {
    name: "Hash Generator",
    slug: "hash-generator",
    category: "developer",
    url: "/developer/hash-generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes online",
    keywords: ["hash generator", "md5 generator", "sha256 hash", "sha1 hash", "sha512 hash"],
    popular: true,
  },
  {
    name: "Cron Expression Builder",
    slug: "cron-builder",
    category: "developer",
    url: "/developer/cron-builder",
    description: "Build and validate cron expressions with a visual editor",
    keywords: ["cron expression", "cron builder", "cron generator", "cron job scheduler"],
  },
  {
    name: "Timestamp Converter",
    slug: "timestamp-converter",
    category: "developer",
    url: "/developer/timestamp-converter",
    description: "Convert Unix timestamps to dates and vice versa",
    keywords: ["timestamp converter", "unix timestamp", "epoch converter", "date to timestamp"],
  },
  {
    name: "Color Picker / Converter",
    slug: "color-converter",
    category: "developer",
    url: "/developer/color-converter",
    description: "Convert colors between HEX, RGB, HSL, and HSB",
    keywords: ["color converter", "hex to rgb", "rgb to hex", "color picker online", "hsl converter"],
  },
  {
    name: "Diff Checker",
    slug: "diff-checker",
    category: "developer",
    url: "/developer/diff-checker",
    description: "Compare two text blocks and see differences highlighted",
    keywords: ["diff checker", "text diff", "compare text", "find differences", "diff tool"],
    popular: true,
  },
  {
    name: "Number Base Converter",
    slug: "base-converter",
    category: "developer",
    url: "/developer/base-converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal",
    keywords: ["base converter", "binary to decimal", "hex to decimal", "number base converter", "decimal to binary"],
  },
  {
    name: "JSON Schema Validator",
    slug: "json-schema",
    category: "developer",
    url: "/developer/json-schema",
    description: "Validate JSON against a JSON Schema definition",
    keywords: ["json schema validator", "validate json schema", "json schema online"],
  },
  {
    name: "HTML Preview",
    slug: "html-preview",
    category: "developer",
    url: "/developer/html-preview",
    description: "Preview raw HTML code in a live sandbox",
    keywords: ["html preview", "html viewer online", "html renderer", "live html preview"],
  },

  // ─── Image — Phase 2 ──────────────────────────────────────────────────────
  {
    name: "Image Compressor",
    slug: "image-compressor",
    category: "image",
    url: "/image/image-compressor",
    description: "Compress JPG, PNG, WebP images without quality loss",
    keywords: ["image compressor", "compress image", "reduce image size", "image optimization"],
    popular: true,
  },
  {
    name: "JPG to PNG",
    slug: "jpg-to-png",
    category: "image",
    url: "/image/jpg-to-png",
    description: "Convert JPG images to PNG format online",
    keywords: ["jpg to png", "convert jpg to png", "jpeg to png converter"],
    popular: true,
  },
  {
    name: "PNG to JPG",
    slug: "png-to-jpg",
    category: "image",
    url: "/image/png-to-jpg",
    description: "Convert PNG images to JPG format online",
    keywords: ["png to jpg", "convert png to jpg", "png to jpeg converter"],
  },
  {
    name: "PNG to WebP",
    slug: "png-to-webp",
    category: "image",
    url: "/image/png-to-webp",
    description: "Convert PNG images to WebP format for smaller file sizes",
    keywords: ["png to webp", "convert png to webp", "webp converter"],
  },
  {
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "image",
    url: "/image/webp-to-jpg",
    description: "Convert WebP images to JPG format online",
    keywords: ["webp to jpg", "convert webp to jpg", "webp to jpeg"],
  },
  {
    name: "Image Resizer",
    slug: "image-resizer",
    category: "image",
    url: "/image/image-resizer",
    description: "Resize images to any dimensions online, free",
    keywords: ["image resizer", "resize image online", "crop image", "scale image"],
    popular: true,
  },
  {
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "image",
    url: "/image/image-to-base64",
    description: "Convert any image to a Base64 encoded string",
    keywords: ["image to base64", "convert image base64", "base64 image encoder"],
  },
  {
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "image",
    url: "/image/base64-to-image",
    description: "Decode a Base64 string and preview/download as image",
    keywords: ["base64 to image", "decode base64 image", "base64 image decoder"],
  },
  {
    name: "SVG Optimizer",
    slug: "svg-optimizer",
    category: "image",
    url: "/image/svg-optimizer",
    description: "Optimize and minify SVG files to reduce their size",
    keywords: ["svg optimizer", "svgo online", "minify svg", "compress svg", "optimize svg"],
  },
  {
    name: "Image Metadata Viewer",
    slug: "image-metadata",
    category: "image",
    url: "/image/image-metadata",
    description: "View EXIF metadata, GPS data, and camera settings from images",
    keywords: ["image metadata viewer", "exif viewer", "exif reader", "image exif data", "photo metadata"],
  },
  {
    name: "SVG to PNG",
    slug: "svg-to-png",
    category: "image",
    url: "/image/svg-to-png",
    description: "Convert SVG files to PNG format online — set custom dimensions",
    keywords: ["svg to png", "convert svg to png", "svg png converter", "svg export png"],
  },
  {
    name: "SVG to JPEG",
    slug: "svg-to-jpeg",
    category: "image",
    url: "/image/svg-to-jpeg",
    description: "Convert SVG files to JPEG format with quality control",
    keywords: ["svg to jpeg", "svg to jpg", "convert svg to jpeg", "svg jpeg converter"],
  },
  {
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "image",
    url: "/image/heic-to-jpg",
    description: "Convert iPhone HEIC photos to JPG format online — no upload needed",
    keywords: ["heic to jpg", "convert heic to jpg", "heic jpg converter", "iphone photo to jpg", "heic to jpeg", "heif to jpg"],
    popular: true,
  },
  {
    name: "HEIC to PNG",
    slug: "heic-to-png",
    category: "image",
    url: "/image/heic-to-png",
    description: "Convert HEIC photos to PNG format online, free and private",
    keywords: ["heic to png", "convert heic to png", "heic png converter", "heif to png", "iphone photo to png"],
  },
  {
    name: "JPG to HEIC",
    slug: "jpg-to-heic",
    category: "image",
    url: "/image/jpg-to-heic",
    description: "Convert JPG images to HEIC format — Apple Safari supported",
    keywords: ["jpg to heic", "convert jpg to heic", "jpeg to heic", "jpg to heif", "jpeg to heif"],
  },
  {
    name: "PNG to HEIC",
    slug: "png-to-heic",
    category: "image",
    url: "/image/png-to-heic",
    description: "Convert PNG images to HEIC format — Apple Safari supported",
    keywords: ["png to heic", "convert png to heic", "png to heif", "png heic converter"],
  },

  // ─── PDF ──────────────────────────────────────────────────────────────────
  {
    name: "PDF to Text",
    slug: "pdf-to-text",
    category: "pdf",
    url: "/pdf/pdf-to-text",
    description: "Extract text content from PDF files",
    keywords: ["pdf to text", "extract text from pdf", "pdf text extractor"],
    popular: true,
  },
  {
    name: "PDF Page Counter",
    slug: "pdf-page-counter",
    category: "pdf",
    url: "/pdf/pdf-page-counter",
    description: "Count the number of pages in a PDF file",
    keywords: ["pdf page counter", "count pdf pages", "pdf pages"],
  },
  {
    name: "PDF Metadata Viewer",
    slug: "pdf-metadata",
    category: "pdf",
    url: "/pdf/pdf-metadata",
    description: "View metadata and properties of PDF files",
    keywords: ["pdf metadata", "pdf properties", "pdf info viewer"],
  },

  // ─── File (Phase 2 — File pages stay ComingSoon for now) ──────────────────
  {
    name: "File Size Converter",
    slug: "file-size-converter",
    category: "file",
    url: "/file/file-size-converter",
    description: "Convert between KB, MB, GB, TB and other file size units",
    keywords: ["file size converter", "mb to gb", "kb to mb", "convert file size"],
  },
  {
    name: "Base64 File Encoder",
    slug: "base64-file-encoder",
    category: "file",
    url: "/file/base64-encoder",
    description: "Encode any file to Base64 format",
    keywords: ["base64 file encoder", "encode file base64", "file to base64"],
  },
  {
    name: "File Hash Generator",
    slug: "file-hash",
    category: "file",
    url: "/file/file-hash",
    description: "Generate MD5, SHA-1, SHA-256 hash of any file",
    keywords: ["file hash generator", "md5 file hash", "sha256 file", "checksum generator"],
  },
  {
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "file",
    url: "/file/csv-to-json",
    description: "Convert CSV files to JSON format online",
    keywords: ["csv to json", "convert csv to json", "csv json converter"],
  },
  {
    name: "CSV to XML",
    slug: "csv-to-xml",
    category: "file",
    url: "/file/csv-to-xml",
    description: "Convert CSV data to XML format online",
    keywords: ["csv to xml", "convert csv to xml", "csv xml converter"],
  },

  // ─── Text — Phase 3 ───────────────────────────────────────────────────────
  {
    name: "Word Counter",
    slug: "word-counter",
    category: "text",
    url: "/text/word-counter",
    description: "Count words, characters, sentences, and paragraphs in text",
    keywords: ["word counter", "character counter", "word count", "count words online"],
    popular: true,
  },
  {
    name: "Character Counter",
    slug: "character-counter",
    category: "text",
    url: "/text/character-counter",
    description: "Count characters with and without spaces in text",
    keywords: ["character counter", "char counter", "count characters", "character count online"],
  },
  {
    name: "Text Case Converter",
    slug: "case-converter",
    category: "text",
    url: "/text/case-converter",
    description: "Convert text to uppercase, lowercase, title case, camelCase and more",
    keywords: ["text case converter", "uppercase lowercase", "title case", "camelcase converter"],
    popular: true,
  },
  {
    name: "Lorem Ipsum Generator",
    slug: "lorem-ipsum",
    category: "text",
    url: "/text/lorem-ipsum",
    description: "Generate Lorem Ipsum placeholder text instantly",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lorem ipsum"],
    popular: true,
  },
  {
    name: "Text to Slug",
    slug: "text-to-slug",
    category: "text",
    url: "/text/text-to-slug",
    description: "Convert any text to a URL-friendly slug",
    keywords: ["text to slug", "url slug generator", "slugify text", "slug converter"],
  },
  {
    name: "Remove Duplicate Lines",
    slug: "remove-duplicates",
    category: "text",
    url: "/text/remove-duplicates",
    description: "Remove duplicate lines from text instantly",
    keywords: ["remove duplicate lines", "remove duplicates", "deduplicate text", "unique lines"],
  },
  {
    name: "Sort Lines",
    slug: "sort-lines",
    category: "text",
    url: "/text/sort-lines",
    description: "Sort lines of text alphabetically or in reverse order",
    keywords: ["sort lines", "sort text", "alphabetical sort", "line sorter"],
  },
  {
    name: "Text Diff",
    slug: "text-diff",
    category: "text",
    url: "/text/text-diff",
    description: "Compare two texts and highlight the differences",
    keywords: ["text diff", "compare text", "find text differences", "text compare tool"],
  },
  {
    name: "String Reverse",
    slug: "string-reverse",
    category: "text",
    url: "/text/string-reverse",
    description: "Reverse any string or text online instantly",
    keywords: ["string reverse", "reverse text", "reverse string online", "backwards text"],
  },
  {
    name: "Whitespace Remover",
    slug: "whitespace-remover",
    category: "text",
    url: "/text/whitespace-remover",
    description: "Remove extra whitespace, blank lines, and leading/trailing spaces",
    keywords: ["whitespace remover", "remove whitespace", "trim text", "remove blank lines"],
  },
  {
    name: "Find and Replace",
    slug: "find-replace",
    category: "text",
    url: "/text/find-replace",
    description: "Find and replace text with support for regex",
    keywords: ["find and replace", "text replace", "string replace online", "find replace tool"],
  },

  // ─── Math — Phase 3 ───────────────────────────────────────────────────────
  {
    name: "Unit Converter",
    slug: "unit-converter",
    category: "math",
    url: "/math/unit-converter",
    description: "Convert between length, weight, temperature, area, and more",
    keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric imperial"],
    popular: true,
  },
  {
    name: "Number System Converter",
    slug: "number-converter",
    category: "math",
    url: "/math/number-converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal",
    keywords: ["number system converter", "binary decimal hex", "base converter", "number base"],
  },
  {
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "math",
    url: "/math/percentage-calculator",
    description: "Calculate percentages, percentage change, and percentage of a number",
    keywords: ["percentage calculator", "percent calculator", "calculate percentage", "percent of number"],
    popular: true,
  },
  {
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "math",
    url: "/math/bmi-calculator",
    description: "Calculate your Body Mass Index (BMI) with metric or imperial units",
    keywords: ["bmi calculator", "body mass index", "calculate bmi", "bmi chart"],
    popular: true,
  },
  {
    name: "Age Calculator",
    slug: "age-calculator",
    category: "math",
    url: "/math/age-calculator",
    description: "Calculate your exact age from date of birth",
    keywords: ["age calculator", "calculate age", "date of birth calculator", "exact age"],
    popular: true,
  },
  {
    name: "Tip Calculator",
    slug: "tip-calculator",
    category: "math",
    url: "/math/tip-calculator",
    description: "Calculate tip amount and split the bill among friends",
    keywords: ["tip calculator", "gratuity calculator", "bill split calculator", "restaurant tip"],
  },
  {
    name: "Scientific Calculator",
    slug: "scientific-calculator",
    category: "math",
    url: "/math/scientific-calculator",
    description: "Scientific calculator with trig, log, exponents, and more",
    keywords: ["scientific calculator", "online calculator", "math calculator", "advanced calculator"],
    popular: true,
  },
];

export function getPopularTools(limit = 12): Tool[] {
  return TOOLS.filter((t) => t.popular).slice(0, limit);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getRelatedTools(current: Tool, limit = 4): Tool[] {
  return TOOLS.filter(
    (t) => t.category === current.category && t.slug !== current.slug
  ).slice(0, limit);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  developer: "Developer",
  image: "Image",
  pdf: "PDF",
  file: "File",
  text: "Text",
  math: "Math",
};
