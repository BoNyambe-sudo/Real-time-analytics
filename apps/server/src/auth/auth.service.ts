import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { UserModel } from "../schemas/user.schema.js"
import { OrganizationModel } from "../schemas/organization.schema.js"
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

  async register(name: string, email: string, password: string) {
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser) throw new ConflictException("Email already registered")

    // Create or get default organization
    let org = await OrganizationModel.findOne({ slug: "default" })
    if (!org) {
      org = await OrganizationModel.create({ name: "Default Organization", slug: "default" })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      orgId: org._id,
      role: "viewer",
    })

    return { id: user._id.toString(), name: user.name, email: user.email, orgId: user.orgId.toString(), role: user.role }
  }
}