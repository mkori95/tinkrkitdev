// Server Component — second-layer auth check.
// Middleware handles the redirect at the edge, but this guards against
// any edge case where the middleware cookie doesn't match the custom domain.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AdminLoginUI } from "./_login";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  // If already authenticated as admin, skip the login page
  if (session?.user?.email === process.env.ADMIN_EMAIL) {
    redirect("/admin/blog");
  }

  return <AdminLoginUI />;
}
