# TinkrKit Chrome Extension

> Every tool you need, right in your browser.

A Manifest V3 Chrome extension that gives you instant access to all 64 tinkrkit.dev tools from any tab. Search, filter by category, click — done. Also adds a right-click **"Open in TinkrKit"** context menu that auto-detects JSON, XML, YAML, SQL, JWT, CSV, Base64, Markdown and opens the right tool automatically.

---

## Folder Structure

```
chrome-extension/
  manifest.json          # Manifest V3 config
  popup.html             # Extension popup UI (340 × 560px max, dark theme)
  popup.js               # Tool list, category tabs, search, chrome.storage.local
  popup.css              # Dark theme styles (system fonts, #6366F1 accent)
  background.js          # Service worker: context menu + auto-detection
  content_script.js      # Phase 2 content bridge (commented out — not yet active)
  icons/
    icon16.png
    icon32.png
    icon48.png
    icon128.png
```

---

## Features

### Popup
- **64 tools** across 6 categories: Developer · Image · PDF · File · Text · Math
- **Real-time search** — type anything, results filter instantly
- **Category tabs** — filter by category with a single click
- **Persistent state** — remembers your last selected category via `chrome.storage.local`
- **Keyboard shortcuts** — press `/` to jump to search, `Escape` to clear it

### Right-click Context Menu
Select any text on any page, right-click, and choose **"Open in TinkrKit"**. The extension auto-detects:

| Content Type | Detected By | Opens |
|---|---|---|
| JSON | `JSON.parse()` | JSON Formatter |
| JWT | `header.payload.signature` format | JWT Decoder |
| XML | `<tag>...</tag>` structure | XML Formatter |
| SQL | `SELECT`, `INSERT`, `FROM`, etc. | SQL Formatter |
| YAML | `key: value` lines | YAML Formatter |
| CSV | Multiple comma-separated rows | CSV Viewer |
| Regex | `/pattern/flags` format | Regex Tester |
| Unix timestamp | 10 or 13 digit number | Timestamp Converter |
| Base64 | Long alphanumeric + `+/=` string | Base64 Decoder |
| Markdown | `#` headings, `- bullets`, ` ``` ` fences | Markdown Preview |
| Long text | 20+ words | Word Counter |
| Anything else | — | TinkrKit homepage |

---

## How to Load Unpacked (Test Locally)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `chrome-extension/` folder inside the project
5. The TinkrKit icon appears in your browser toolbar
6. Click it — the popup opens with all 64 tools

### After Making Code Changes

Go to `chrome://extensions` → find TinkrKit → click the **↺ refresh icon**

Alternatively, press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac) while on the extensions page with TinkrKit focused.

### Testing the Right-click Menu

1. Open any web page
2. Select some text (try selecting a JSON snippet)
3. Right-click the selection
4. Click **"Open in TinkrKit"**
5. The correct tool opens in a new tab

### Testing Search

1. Open the popup
2. Type "json" — only JSON tools appear
3. Press `Escape` — search clears
4. Press `/` anywhere in the popup — search input is focused

---

## How to Publish to Chrome Web Store

### Prerequisites
- A Google Developer account ($5 one-time fee)
  → [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
- Screenshots (1280×800 or 640×400, at least 1 required)
- Store listing description

### Steps

1. **Create a ZIP of only the extension files:**
   ```bash
   cd /path/to/tinkrkitdev
   zip -r tinkrkit-extension-v1.0.0.zip chrome-extension/ \
     --exclude "*.DS_Store" \
     --exclude "*/.git/*"
   ```

2. **Go to the Chrome Web Store Developer Dashboard:**
   [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)

3. Click **"New Item"** → upload the ZIP

4. Fill in the store listing:
   - **Name:** TinkrKit
   - **Short description:** Every tool you need, right in your browser. JSON formatter, image compressor, PDF reader and 60+ more.
   - **Category:** Developer Tools
   - **Language:** English

5. Upload screenshots + use `icons/icon128.png` as the store icon

6. Add your privacy policy URL: `https://tinkrkit.dev/privacy`

7. Submit for review (typically 1–3 business days)

### Review Tips
- Permissions are minimal (`storage`, `tabs`, `contextMenus`) — all justified
- No remote code execution — all tool logic runs on tinkrkit.dev pages
- No user data collected — `chrome.storage.local` stores only last-used category

---

## Version History

| Version | Notes |
|---------|-------|
| 1.0.0 | Popup with 64 tools · category tabs · real-time search · right-click context menu with auto-detection |
