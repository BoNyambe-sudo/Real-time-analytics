import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { verifyAuthjsCookie } from "@realtime/shared"
import { ApiKeyModel } from "../schemas/api-key.schema.js"
import { MONGOOSE_CONNECTION } from "../database/mongoose.module.js"
import { Inject } from "@nestjs/common"
import { Socket } from "socket.io"

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(@Inject(MONGOOSE_CONNECTION) private readonly conn: typeof import("mongoose")) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>()
    const user = await this.authenticate(client)
    if (!user) {
      throw new UnauthorizedException("Authentication required")
    }
    client.data.user = user
    return true
  }

  async authenticate(client: Socket): Promise<{ id: string; orgId: string; role: string } | null> {
    const cookieHeader = client.handshake.headers.cookie || ""
    const token = this.extractCookie(cookieHeader, "authjs.session-token") || this.extractCookie(cookieHeader, "__Secure-authjs.session-token")

    if (token) {
      const secret = process.env.AUTH_SECRET!
      const payload = await verifyAuthjsCookie(token, secret)
      if (payload) {
        return { id: payload.sub!, orgId: payload.orgId!, role: payload.role! }
      }
    }

    const apiKey = client.handshake.query.token as string
    if (apiKey) {
      const doc = await ApiKeyModel.findOne({ revokedAt: { $exists: false } })
      if (doc && (!doc.expiresAt || new Date() < doc.expiresAt) && doc.verify(apiKey)) {
        return { id: doc._id.toString(), orgId: doc.orgId.toString(), role: "api-key" }
      }
    }

    return null
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