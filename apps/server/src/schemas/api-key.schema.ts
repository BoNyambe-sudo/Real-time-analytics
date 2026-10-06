import { Schema, model } from "mongoose"
import mongoose from "mongoose"
import { createHash } from "node:crypto"

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

const ApiKeySchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, maxlength: 120 },
    prefix: { type: String, required: true, maxlength: 8 },
    hash: { type: String, required: true },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
)

ApiKeySchema.index({ orgId: 1, prefix: 1 }, { unique: true })
ApiKeySchema.index({ hash: 1 })

ApiKeySchema.statics.generateKey = function (): { key: string; prefix: string; hash: string } {
  const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  const prefix = key.slice(0, 8)
  const hash = sha256(key)
  return { key, prefix, hash }
}

ApiKeySchema.methods.verify = function (key: string): boolean {
  return sha256(key) === this.hash
}

export const ApiKeyModel = mongoose.models.ApiKey ?? model("ApiKey", ApiKeySchema)