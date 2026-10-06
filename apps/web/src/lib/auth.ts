import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthResult } from "next-auth"
import { loginSchema } from "@realtime/shared"

const nextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" as const },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) throw new Error("Invalid credentials")

        const res = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        })

        if (!res.ok) return null
        const user = await res.json()
        return user
      },
    }),
  ],
  callbacks: {
    // @ts-expect-error - loose types for callback params
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        token.orgId = user.orgId
        token.role = user.role
      }
      return token
    },
    // @ts-expect-error - loose types for callback params
    async session({ session, token }) {
      const t = token as { sub?: string; name?: string | null; email?: string | null; orgId?: string; role?: "admin" | "viewer" }
      session.user = {
        id: t.sub || "",
        name: t.name ?? null,
        email: t.email ?? null,
        orgId: t.orgId || "",
        role: t.role || "viewer",
      } as typeof session.user
      return session
    },
  },
}

const nextAuthResult = NextAuth(nextAuthConfig)

export const handlers = nextAuthResult.handlers as any
export const signIn = nextAuthResult.signIn as any
export const signOut = nextAuthResult.signOut as any
export const auth = nextAuthResult.auth as any

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      orgId: string
      role: "admin" | "viewer"
    }
  }
  interface User {
    orgId: string
    role: "admin" | "viewer"
  }
  interface JWT {
    orgId: string
    role: "admin" | "viewer"
  }
}