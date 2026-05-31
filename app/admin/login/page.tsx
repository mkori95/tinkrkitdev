"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const error  = params.get("error");

  const isAccessDenied = error === "AccessDenied";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <h1 className="mb-1 text-center text-xl font-bold text-foreground">
            Admin Access
          </h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Restricted to authorized accounts only.
          </p>

          {/* Error state */}
          {isAccessDenied && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              ⚠️ Access denied. This Google account is not authorized to access the admin panel.
            </div>
          )}

          {error && !isAccessDenied && (
            <div className="mb-5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
              Sign-in error: {error}. Please try again.
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/admin/blog" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {/* Google icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Access restricted to{" "}
            <span className="font-medium text-foreground">
              {process.env.NEXT_PUBLIC_ADMIN_EMAIL_HINT ?? "the authorized account"}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
