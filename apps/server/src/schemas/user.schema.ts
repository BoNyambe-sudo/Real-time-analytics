import { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, maxlength: 255 },
    passwordHash: { type: String, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    role: { type: String, enum: ["admin", "viewer"], default: "viewer" },
  },
  { timestamps: true, versionKey: false }
)

UserSchema.index({ email: 1 }, { unique: true })

export const UserModel = models.User ?? model("User", UserSchema)