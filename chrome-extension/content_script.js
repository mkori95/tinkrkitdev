// Phase 2 — uncomment in manifest.json when ready to activate
// Content script: runs on every page, bridges selected text → background service worker

// ─────────────────────────────────────────────────────────────────────────────
// To activate Phase 2:
//  1. In manifest.json, add to "permissions": "contextMenus", "activeTab", "scripting"
//  2. In manifest.json, move "_phase2_content_scripts" to top-level "content_scripts"
//  3. Uncomment background.js code
//  4. Reload the extension at chrome://extensions
// ─────────────────────────────────────────────────────────────────────────────

/*

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_SELECTION") {
    const selection = window.getSelection()?.toString() || "";
    sendResponse({ selection });
  }
});

*/
