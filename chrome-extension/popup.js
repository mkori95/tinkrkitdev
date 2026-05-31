// TinkrKit Chrome Extension — popup.js
// Phase 1: tool launcher (opens tinkrkit.dev tools in a new tab)

const BASE_URL = "https://tinkrkit.dev";

// ── Tools registry ───────────────────────────────────────────────────────────
// Each entry: { name, url, icon (emoji), category }
// category values must match the data-cat on the tab buttons (lowercase).

const TOOLS = [
  // ── Developer ───────────────────────────────────────────────────────────
  { name: "JSON Formatter",           url: "/developer/json-formatter",        icon: "📋", category: "developer" },
  { name: "JSON Validator",           url: "/developer/json-validator",        icon: "✅", category: "developer" },
  { name: "JSON Minifier",            url: "/developer/json-minifier",         icon: "🗜️", category: "developer" },
  { name: "XML Formatter",            url: "/developer/xml-formatter",         icon: "📄", category: "developer" },
  { name: "XML to JSON",              url: "/developer/xml-to-json",           icon: "🔄", category: "developer" },
  { name: "JSON to XML",              url: "/developer/json-to-xml",           icon: "🔄", category: "developer" },
  { name: "YAML Formatter",           url: "/developer/yaml-formatter",        icon: "📝", category: "developer" },
  { name: "JSON to YAML",             url: "/developer/json-to-yaml",          icon: "🔄", category: "developer" },
  { name: "CSV Viewer",               url: "/developer/csv-viewer",            icon: "📊", category: "developer" },
  { name: "JSON to CSV",              url: "/developer/json-to-csv",           icon: "🔄", category: "developer" },
  { name: "SQL Formatter",            url: "/developer/sql-formatter",         icon: "🗄️", category: "developer" },
  { name: "Markdown Preview",         url: "/developer/markdown-preview",      icon: "👁️", category: "developer" },
  { name: "Base64 Encoder / Decoder", url: "/developer/base64",                icon: "🔐", category: "developer" },
  { name: "URL Encoder / Decoder",    url: "/developer/url-encoder",           icon: "🔗", category: "developer" },
  { name: "HTML Encoder / Decoder",   url: "/developer/html-encoder",          icon: "🏷️", category: "developer" },
  { name: "JWT Decoder",              url: "/developer/jwt-decoder",           icon: "🔑", category: "developer" },
  { name: "Regex Tester",             url: "/developer/regex-tester",          icon: "🔎", category: "developer" },
  { name: "UUID Generator",           url: "/developer/uuid-generator",        icon: "🎲", category: "developer" },
  { name: "Hash Generator",           url: "/developer/hash-generator",        icon: "🔢", category: "developer" },
  { name: "Cron Expression Builder",  url: "/developer/cron-builder",          icon: "⏱️", category: "developer" },
  { name: "Timestamp Converter",      url: "/developer/timestamp-converter",   icon: "🕐", category: "developer" },
  { name: "Color Picker / Converter", url: "/developer/color-converter",       icon: "🎨", category: "developer" },
  { name: "Diff Checker",             url: "/developer/diff-checker",          icon: "↔️", category: "developer" },
  { name: "Number Base Converter",    url: "/developer/base-converter",        icon: "🔢", category: "developer" },
  { name: "JSON Schema Validator",    url: "/developer/json-schema",           icon: "📋", category: "developer" },
  { name: "HTML Preview",             url: "/developer/html-preview",          icon: "🌐", category: "developer" },

  // ── Image ────────────────────────────────────────────────────────────────
  { name: "Image Compressor",         url: "/image/image-compressor",          icon: "🗜️", category: "image" },
  { name: "JPG to PNG",               url: "/image/jpg-to-png",                icon: "🖼️", category: "image" },
  { name: "PNG to JPG",               url: "/image/png-to-jpg",                icon: "🖼️", category: "image" },
  { name: "PNG to WebP",              url: "/image/png-to-webp",               icon: "🖼️", category: "image" },
  { name: "WebP to JPG",              url: "/image/webp-to-jpg",               icon: "🖼️", category: "image" },
  { name: "Image Resizer",            url: "/image/image-resizer",             icon: "↔️", category: "image" },
  { name: "Image to Base64",          url: "/image/image-to-base64",           icon: "🔐", category: "image" },
  { name: "Base64 to Image",          url: "/image/base64-to-image",           icon: "🖼️", category: "image" },
  { name: "SVG Optimizer",            url: "/image/svg-optimizer",             icon: "✨", category: "image" },
  { name: "Image Metadata Viewer",    url: "/image/image-metadata",            icon: "ℹ️", category: "image" },
  { name: "SVG to PNG",               url: "/image/svg-to-png",                icon: "🖼️", category: "image" },
  { name: "SVG to JPEG",              url: "/image/svg-to-jpeg",               icon: "🖼️", category: "image" },

  // ── PDF ──────────────────────────────────────────────────────────────────
  { name: "PDF to Text",              url: "/pdf/pdf-to-text",                 icon: "📄", category: "pdf" },
  { name: "PDF Page Counter",         url: "/pdf/pdf-page-counter",            icon: "🔢", category: "pdf" },
  { name: "PDF Metadata Viewer",      url: "/pdf/pdf-metadata",                icon: "ℹ️", category: "pdf" },

  // ── File ─────────────────────────────────────────────────────────────────
  { name: "File Hash Generator",      url: "/file/file-hash",                  icon: "🔢", category: "file" },
  { name: "File Size Converter",      url: "/file/file-size-converter",        icon: "📏", category: "file" },
  { name: "CSV to JSON",              url: "/file/csv-to-json",                icon: "🔄", category: "file" },
  { name: "CSV to XML",               url: "/file/csv-to-xml",                 icon: "🔄", category: "file" },
  { name: "Base64 File Encoder",      url: "/file/base64-encoder",             icon: "🔐", category: "file" },

  // ── Text ─────────────────────────────────────────────────────────────────
  { name: "Word Counter",             url: "/text/word-counter",               icon: "🔢", category: "text" },
  { name: "Character Counter",        url: "/text/character-counter",          icon: "🔤", category: "text" },
  { name: "Text Case Converter",      url: "/text/case-converter",             icon: "🔡", category: "text" },
  { name: "Lorem Ipsum Generator",    url: "/text/lorem-ipsum",                icon: "📝", category: "text" },
  { name: "Text to Slug",             url: "/text/text-to-slug",               icon: "🔗", category: "text" },
  { name: "Remove Duplicate Lines",   url: "/text/remove-duplicates",          icon: "✂️", category: "text" },
  { name: "Sort Lines",               url: "/text/sort-lines",                 icon: "📶", category: "text" },
  { name: "Text Diff",                url: "/text/text-diff",                  icon: "↔️", category: "text" },
  { name: "String Reverse",           url: "/text/string-reverse",             icon: "🔀", category: "text" },
  { name: "Whitespace Remover",       url: "/text/whitespace-remover",         icon: "🧹", category: "text" },
  { name: "Find and Replace",         url: "/text/find-replace",               icon: "🔍", category: "text" },

  // ── Math ─────────────────────────────────────────────────────────────────
  { name: "Unit Converter",           url: "/math/unit-converter",             icon: "📏", category: "math" },
  { name: "Number System Converter",  url: "/math/number-converter",           icon: "🔢", category: "math" },
  { name: "Percentage Calculator",    url: "/math/percentage-calculator",      icon: "💯", category: "math" },
  { name: "BMI Calculator",           url: "/math/bmi-calculator",             icon: "⚖️", category: "math" },
  { name: "Age Calculator",           url: "/math/age-calculator",             icon: "🎂", category: "math" },
  { name: "Tip Calculator",           url: "/math/tip-calculator",             icon: "💰", category: "math" },
  { name: "Scientific Calculator",    url: "/math/scientific-calculator",      icon: "🧮", category: "math" },
];

// Human-readable category labels (keyed by data-cat value)
const CAT_LABELS = {
  developer: "Developer",
  image:     "Image",
  pdf:       "PDF",
  file:      "File",
  text:      "Text",
  math:      "Math",
};

// Category order for display
const CAT_ORDER = ["developer", "image", "pdf", "file", "text", "math"];

// ── State ────────────────────────────────────────────────────────────────────

let activeCategory = "all";   // matches data-cat on tab buttons
let searchQuery    = "";

// ── Render ───────────────────────────────────────────────────────────────────

function getVisibleTools() {
  let tools = TOOLS;

  // Filter by category
  if (activeCategory !== "all") {
    tools = tools.filter(t => t.category === activeCategory);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    tools = tools.filter(
      t => t.name.toLowerCase().includes(q) || t.category.includes(q)
    );
  }

  return tools;
}

function renderTools() {
  const listEl    = document.getElementById("toolsList");
  const noResults = document.getElementById("noResults");
  const tools     = getVisibleTools();

  listEl.innerHTML = "";

  if (tools.length === 0) {
    noResults.style.display = "flex";
    return;
  }

  noResults.style.display = "none";

  // When showing "All" (no category filter), group by category in defined order.
  // When a specific category is active, show a flat list with one heading.
  if (activeCategory === "all") {
    // Build a map: category → matching tools (preserving CAT_ORDER)
    const grouped = {};
    for (const cat of CAT_ORDER) grouped[cat] = [];
    for (const tool of tools) grouped[tool.category].push(tool);

    for (const cat of CAT_ORDER) {
      if (grouped[cat].length === 0) continue;

      const heading = document.createElement("div");
      heading.className = "cat-heading";
      heading.textContent = CAT_LABELS[cat];
      listEl.appendChild(heading);

      for (const tool of grouped[cat]) {
        listEl.appendChild(buildToolRow(tool));
      }
    }
  } else {
    // Single category — show heading then flat list
    const heading = document.createElement("div");
    heading.className = "cat-heading";
    heading.textContent = CAT_LABELS[activeCategory];
    listEl.appendChild(heading);

    for (const tool of tools) {
      listEl.appendChild(buildToolRow(tool));
    }
  }
}

function buildToolRow(tool) {
  const row = document.createElement("div");
  row.className = "tool-row";
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.title = tool.name;

  row.innerHTML =
    `<span class="tool-icon">${tool.icon}</span>` +
    `<span class="tool-name">${tool.name}</span>` +
    `<span class="tool-arrow">›</span>`;

  row.addEventListener("click", () => openTool(tool));

  // Keyboard accessibility
  row.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openTool(tool);
    }
  });

  return row;
}

// ── Actions ──────────────────────────────────────────────────────────────────

function openTool(tool) {
  // Persist last-used tool
  chrome.storage.local.set({ lastTool: tool.url });
  chrome.tabs.create({ url: BASE_URL + tool.url });
  window.close();
}

function setCategory(cat) {
  activeCategory = cat;

  // Update tab active state
  document.querySelectorAll(".tab").forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  // Persist
  chrome.storage.local.set({ lastCategory: cat });

  // Re-render
  renderTools();

  // Scroll tools list to top
  document.getElementById("toolsWrap").scrollTop = 0;
}

function setSearch(query) {
  searchQuery = query;

  // Show / hide clear button
  const clearBtn = document.getElementById("searchClear");
  clearBtn.style.display = query.length > 0 ? "block" : "none";

  renderTools();

  // Scroll tools list to top
  document.getElementById("toolsWrap").scrollTop = 0;
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // ── Restore persisted state ──────────────────────────────────────────────
  chrome.storage.local.get(["lastCategory", "lastSearch"], result => {
    // Restore category (default: "all")
    const savedCat = result.lastCategory || "all";

    // Restore search — only restore if it was saved alongside a category tab
    // (we intentionally don't restore search on open — fresh start feels better)
    activeCategory = savedCat;

    // Sync tab buttons to restored category
    document.querySelectorAll(".tab").forEach(btn => {
      const isActive = btn.dataset.cat === savedCat;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    renderTools();
  });

  // ── Category tabs ────────────────────────────────────────────────────────
  document.getElementById("tabs").addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    setCategory(tab.dataset.cat);
  });

  // ── Search input ─────────────────────────────────────────────────────────
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", e => {
    setSearch(e.target.value);
  });

  // Clear button
  document.getElementById("searchClear").addEventListener("click", () => {
    searchInput.value = "";
    setSearch("");
    searchInput.focus();
  });

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  document.addEventListener("keydown", e => {
    // Escape: clear search if active, otherwise close popup
    if (e.key === "Escape") {
      if (searchQuery) {
        searchInput.value = "";
        setSearch("");
        searchInput.focus();
      }
      // Note: window.close() in keydown on popup can cause flicker; skip it.
      return;
    }

    // "/" or any printable char when search is not focused: focus search
    if (
      e.key === "/" &&
      document.activeElement !== searchInput
    ) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Auto-focus search on open
  searchInput.focus();

  // ── Footer button ────────────────────────────────────────────────────────
  document.getElementById("openSite").addEventListener("click", () => {
    chrome.tabs.create({ url: BASE_URL });
    window.close();
  });
});
