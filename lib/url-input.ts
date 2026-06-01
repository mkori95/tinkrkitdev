/**
 * lib/url-input.ts
 *
 * Reads the `?input=` URL search parameter on first client-side render.
 * Used by tool pages to pre-populate their input when opened via the
 * TinkrKit Chrome extension context menu.
 *
 * Safe for SSR — returns "" when `window` is not available.
 */
export function getUrlInput(): string {
  if (typeof window === "undefined") return "";
  const raw = new URLSearchParams(window.location.search).get("input");
  return raw ? decodeURIComponent(raw) : "";
}
