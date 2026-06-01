// TinkrKit Chrome Extension — background.js (Service Worker)
// Registers a right-click context menu, auto-detects content type,
// and opens the matching TinkrKit tool with the selected text pre-populated
// via the ?input= query parameter.

const BASE_URL = "https://tinkrkit.dev";

// ── Tool detection ───────────────────────────────────────────────────────────
// Returns the tool path AND the query param so the tool page can pre-fill
// its input and auto-process on load.

function detectTool(text) {
  const trimmed = text.trim();
  if (!trimmed) return { url: "" };

  const q = encodeURIComponent(trimmed);

  // ── JSON ────────────────────────────────────────────────────────────────
  try {
    JSON.parse(trimmed);
    return { url: `/developer/json-formatter?input=${q}` };
  } catch (_) {}

  // ── JWT (three base64url segments separated by dots) ───────────────────
  if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(trimmed)) {
    return { url: `/developer/jwt-decoder?input=${q}` };
  }

  // ── XML ─────────────────────────────────────────────────────────────────
  if (/^\s*<[a-zA-Z][\w:-]*[\s>]/.test(trimmed) && /<\/[a-zA-Z][\w:-]*>/.test(trimmed)) {
    return { url: `/developer/xml-formatter?input=${q}` };
  }

  // ── SQL ─────────────────────────────────────────────────────────────────
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(trimmed)) {
    return { url: `/developer/sql-formatter?input=${q}` };
  }

  // ── YAML (key: value lines, not XML, not JSON) ───────────────────────────
  if (
    /^[\w\-]+:\s*.+/m.test(trimmed) &&
    !trimmed.startsWith("<") &&
    !trimmed.startsWith("{")
  ) {
    return { url: `/developer/yaml-formatter?input=${q}` };
  }

  // ── CSV (multiple rows with commas) ─────────────────────────────────────
  const csvLines = trimmed.split("\n").filter(l => l.trim());
  if (csvLines.length > 1 && csvLines[0].split(",").length > 1) {
    return { url: `/developer/csv-viewer?input=${q}` };
  }

  // ── Regex-like patterns ──────────────────────────────────────────────────
  if (/^\/.*\/[gimsuy]*$/.test(trimmed)) {
    return { url: `/developer/regex-tester?input=${q}` };
  }

  // ── Unix / ISO timestamp ─────────────────────────────────────────────────
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    return { url: `/developer/timestamp-converter?input=${q}` };
  }

  // ── Base64 (long alphanumeric string with +/= padding) ──────────────────
  if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(trimmed.replace(/\s/g, ""))) {
    return { url: `/developer/base64?input=${q}` };
  }

  // ── Markdown (has headings, bullets, or code fences) ────────────────────
  if (/^#{1,6}\s+/.test(trimmed) || /^[-*]\s+/m.test(trimmed) || /```/.test(trimmed)) {
    return { url: `/developer/markdown-preview?input=${q}` };
  }

  // ── Long text — word counter ─────────────────────────────────────────────
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 20) {
    return { url: `/text/word-counter?input=${q}` };
  }

  // ── Default — open homepage (no input param needed) ──────────────────────
  return { url: "" };
}

// ── Context menu setup ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id:       "tinkrkit-open",
      title:    "Open in TinkrKit",
      contexts: ["selection"],
    });
  });
});

// ── Context menu click handler ───────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "tinkrkit-open") return;

  const selected = info.selectionText || "";
  const { url }  = detectTool(selected);

  chrome.tabs.create({ url: BASE_URL + url });
});

// ── Message bridge ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "OPEN_TOOL") {
    chrome.tabs.create({ url: BASE_URL + msg.url });
    sendResponse({ ok: true });
  }
});
