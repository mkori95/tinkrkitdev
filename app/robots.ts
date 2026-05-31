// app/robots.ts — generates /robots.txt via Next.js Metadata API
// Replaces the static public/robots.txt (this file takes precedence).

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow:     "/",
      disallow:  "/admin/",   // keep admin routes out of search indices
    },
    sitemap: "https://tinkrkit.dev/sitemap.xml",
  };
}
