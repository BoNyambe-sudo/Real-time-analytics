import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { verifyAuthjsCookie } from "@realtime/shared"

@Injectable()
export class SessionAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const cookieHeader = req.headers.cookie || ""
    const token = this.extractCookie(cookieHeader, "authjs.session-token") || this.extractCookie(cookieHeader, "__Secure-authjs.session-token")

    if (!token) {
      return false
    }

    const secret = process.env.AUTH_SECRET!
    const payload = await verifyAuthjsCookie(token, secret)

    if (!payload) {
      throw new UnauthorizedException("Invalid session cookie")
    }

    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      orgId: payload.orgId,
      role: payload.role,
    }
    return true
  }

  private extractCookie(header: string, name: string): string | null {
    const cookies = header.split(";").map((c) => c.trim())
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split("=")
      if (key === name) {
        return rest.join("=")
      }
    }
    return null
  }
}