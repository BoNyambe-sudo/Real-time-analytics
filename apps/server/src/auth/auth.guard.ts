import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { SessionAuthGuard } from "./session-auth.guard.js"
import { ApiKeyGuard } from "./api-key.guard.js"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionAuthGuard: SessionAuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    console.log('[AuthGuard] Headers:', JSON.stringify(req.headers))
    const sessionResult = await this.sessionAuthGuard.canActivate(context)
    console.log('[AuthGuard] SessionAuthGuard result:', sessionResult)
    if (sessionResult === true) {
      return true
    }
    if (sessionResult === false) {
      const apiKeyResult = await this.apiKeyGuard.canActivate(context)
      console.log('[AuthGuard] ApiKeyGuard result:', apiKeyResult)
      return apiKeyResult
    }
    return false
  }
}