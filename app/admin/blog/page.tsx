// Server Component — second-layer protection.
// Middleware guards at the edge; this guards at the server-render level.
// Both must pass for the page to render, regardless of domain or CDN config.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminBlogPanel } from "./_panel";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return <AdminBlogPanel />;
}
