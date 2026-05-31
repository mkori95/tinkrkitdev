// lib/auth-options.ts
// Shared NextAuth config — used by the route handler AND getServerSession calls.

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Guard: if Google credentials aren't set (dev before OAuth setup), we still
// export a valid authOptions so the server doesn't crash.  The Google provider
// simply won't be included and login will show a "Configuration" error from
// NextAuth — which is better than a 500 on every request.
const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

if (!googleConfigured) {
  console.warn(
    "[auth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set.\n" +
    "       Admin login will not work until these are added to .env.local."
  );
}

export const authOptions: NextAuthOptions = {
  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId:     process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],

  callbacks: {
    // Deny anyone whose email doesn't match ADMIN_EMAIL — no session created.
    async signIn({ user }) {
      return user.email === process.env.ADMIN_EMAIL;
    },

    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },

    async session({ session }) {
      return session;
    },
  },

  session: { strategy: "jwt" },

  pages: {
    signIn: "/admin/login",
    error:  "/admin/login", // ?error=AccessDenied shown on login page
  },
};
