// TinkrKit Chrome Extension — background.js (Service Worker)
// Registers a right-click context menu and auto-detects content type
// to open the most relevant TinkrKit tool.

const BASE_URL = "https://tinkrkit.dev";

// ── Tool detection ───────────────────────────────────────────────────────────

function detectTool(text) {
  const trimmed = text.trim();
  if (!trimmed) return { name: "TinkrKit", url: "" };

  // ── JSON ────────────────────────────────────────────────────────────────
  try {
    JSON.parse(trimmed);
    return { name: "JSON Formatter", url: "/developer/json-formatter" };
  } catch (_) {}

  // ── JWT (three base64url segments separated by dots) ───────────────────
  if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(trimmed)) {
    return { name: "JWT Decoder", url: "/developer/jwt-decoder" };
  }

  // ── XML ─────────────────────────────────────────────────────────────────
  if (/^\s*<[a-zA-Z][\w:-]*[\s>]/.test(trimmed) && /<\/[a-zA-Z][\w:-]*>/.test(trimmed)) {
    return { name: "XML Formatter", url: "/developer/xml-formatter" };
  }

  // ── SQL ─────────────────────────────────────────────────────────────────
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(trimmed)) {
    return { name: "SQL Formatter", url: "/developer/sql-formatter" };
  }

  // ── YAML (key: value lines, not XML, not JSON) ───────────────────────────
  if (
    /^[\w\-]+:\s*.+/m.test(trimmed) &&
    !trimmed.startsWith("<") &&
    !trimmed.startsWith("{")
  ) {
    return { name: "YAML Formatter", url: "/developer/yaml-formatter" };
  }

  // ── CSV (multiple rows with commas) ─────────────────────────────────────
  const csvLines = trimmed.split("\n").filter(l => l.trim());
  if (csvLines.length > 1 && csvLines[0].split(",").length > 1) {
    return { name: "CSV Viewer", url: "/developer/csv-viewer" };
  }

  // ── Regex-like patterns ──────────────────────────────────────────────────
  if (/^\/.*\/[gimsuy]*$/.test(trimmed)) {
    return { name: "Regex Tester", url: "/developer/regex-tester" };
  }

  // ── Unix / ISO timestamp ─────────────────────────────────────────────────
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    return { name: "Timestamp Converter", url: "/developer/timestamp-converter" };
  }

  // ── Base64 (long alphanumeric string with +/= padding) ──────────────────
  if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(trimmed.replace(/\s/g, ""))) {
    return { name: "Base64 Decoder", url: "/developer/base64" };
  }

  // ── Markdown (has headings, bullets, code fences) ───────────────────────
  if (/^#{1,6}\s+/.test(trimmed) || /^[-*]\s+/m.test(trimmed) || /```/.test(trimmed)) {
    return { name: "Markdown Preview", url: "/developer/markdown-preview" };
  }

  // ── Long text — word counter ─────────────────────────────────────────────
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 20) {
    return { name: "Word Counter", url: "/text/word-counter" };
  }

  // ── Default — open homepage ──────────────────────────────────────────────
  return { name: "TinkrKit", url: "" };
}

// ── Context menu setup ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Remove any existing menus to avoid duplicates on reload
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "tinkrkit-open",
      title: "Open in TinkrKit",
      contexts: ["selection"],
    });
  });
});

// ── Context menu click handler ───────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "tinkrkit-open") return;

  const selected = info.selectionText || "";
  const detected = detectTool(selected);

  chrome.tabs.create({ url: BASE_URL + detected.url });
});

// ── Message bridge (for future content_script use) ───────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "OPEN_TOOL") {
    chrome.tabs.create({ url: BASE_URL + msg.url });
    sendResponse({ ok: true });
  }
});
