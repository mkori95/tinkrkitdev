// app/admin/page.tsx
// Fixes the 404 on /admin — redirects to /admin/blog.
// Middleware already ensures only admins reach this page.

import { redirect } from "next/navigation";

export default function AdminRootPage() {
  redirect("/admin/blog");
}
