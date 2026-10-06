import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common"
import { AuthService } from "./auth.service.js"
import { AuthGuard } from "./auth.guard.js"
import { z } from "zod"

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const { email, password } = loginSchema.parse(body)
    return this.authService.validateUser(email, password)
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Body() body: unknown, req: any) {
    return req.user
  }
}