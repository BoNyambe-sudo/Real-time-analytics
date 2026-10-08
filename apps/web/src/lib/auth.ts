import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthResult } from "next-auth";
import { loginSchema } from "@realtime/shared";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

const nextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" as const },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("Invalid credentials");

        const res = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });

        if (!res.ok) return null;
        const user = await res.json();
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.orgId = user.orgId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const t = token as {
        sub?: string;
        name?: string | null;
        email?: string | null;
        orgId?: string;
        role?: "admin" | "viewer";
      };
      session.user = {
        id: t.sub || "",
        name: t.name ?? null,
        email: t.email ?? null,
        orgId: t.orgId || "",
        role: t.role || "viewer",
      } as typeof session.user;
      return session;
    },
  },
};

const nextAuthResult = NextAuth(nextAuthConfig);

export const handlers = nextAuthResult.handlers;
export const signIn: NextAuthResult["signIn"] = nextAuthResult.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuthResult.signOut;
export const auth: NextAuthResult["auth"] = nextAuthResult.auth;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      orgId: string;
      role: "admin" | "viewer";
    };
  }
  interface User {
    orgId: string;
    role: "admin" | "viewer";
  }
  interface JWT {
    orgId: string;
    role: "admin" | "viewer";
  }
}
