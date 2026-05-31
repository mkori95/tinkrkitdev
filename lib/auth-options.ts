// lib/auth-options.ts
// Shared NextAuth config — imported by the route handler and (via getToken) middleware.

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Block anyone who isn't ADMIN_EMAIL before a session is ever created.
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
    error:  "/admin/login", // handles AccessDenied → shows error on login page
  },
};
