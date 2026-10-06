import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { SessionAuthGuard } from "./session-auth.guard.js"
import { ApiKeyGuard } from "./api-key.guard.js"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionAuthGuard: SessionAuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const sessionResult = await this.sessionAuthGuard.canActivate(context)
    if (sessionResult === true) {
      return true
    }
    if (sessionResult === false) {
      return this.apiKeyGuard.canActivate(context)
    }
    return false
  }
}