import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { ApiKeyModel } from "../schemas/api-key.schema.js"
import { MONGOOSE_CONNECTION } from "../database/mongoose.module.js"
import { Inject } from "@nestjs/common"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(MONGOOSE_CONNECTION) private readonly conn: typeof import("mongoose")) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const key = req.headers["x-api-key"] || this.extractBearer(req.headers.authorization)

    if (!key) {
      return false
    }

    const apiKey = await this.verifyApiKey(key)
    if (!apiKey) {
      throw new UnauthorizedException("Invalid API key")
    }

    req.user = {
      id: apiKey._id.toString(),
      orgId: apiKey.orgId.toString(),
      role: "api-key",
      apiKey: true,
    }
    return true
  }

  private async verifyApiKey(key: string) {
    const doc = await ApiKeyModel.findOne({ revokedAt: { $exists: false } })
    if (!doc) return null

    if (doc.expiresAt && new Date() > doc.expiresAt) return null
    if (!doc.verify(key)) return null

    doc.lastUsedAt = new Date()
    await doc.save()
    return doc
  }

  private extractBearer(authHeader?: string): string | null {
    if (!authHeader) return null
    const [scheme, token] = authHeader.split(" ")
    return scheme.toLowerCase() === "bearer" ? token : null
  }
}