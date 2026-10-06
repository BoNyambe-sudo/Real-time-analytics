import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface AuthenticatedRequest extends NextRequest {
  auth: {
    user: {
      id: string
      name?: string | null
      email?: string | null
      orgId: string
      role: "admin" | "viewer"
    }
  } | null
}

const middleware = auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const protectedPaths = ["/dashboard", "/settings"]
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if ((pathname === "/login" || pathname.startsWith("/login")) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
});

export default middleware as any

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login"],
}