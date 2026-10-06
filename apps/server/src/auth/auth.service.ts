import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserModel } from "../schemas/user.schema.js"
import bcrypt from "bcrypt"
import { MONGOOSE_CONNECTION } from "../database/mongoose.module.js"
import { Inject } from "@nestjs/common"

@Injectable()
export class AuthService {
  constructor(@Inject(MONGOOSE_CONNECTION) private readonly mongoose: typeof import("mongoose")) {}

  async validateUser(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean()
    if (!user) throw new UnauthorizedException("Invalid credentials")

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException("Invalid credentials")

    return { id: user._id.toString(), name: user.name, email: user.email, orgId: user.orgId.toString(), role: user.role }
  }
}