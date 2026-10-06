import { Injectable } from "@nestjs/common"
import { ApiKeyModel } from "../schemas/api-key.schema.js"
import { createHash } from "node:crypto"

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

export interface ApiKeyDoc {
  _id: any
  orgId: any
  name: string
  prefix: string
  hash: string
  lastUsedAt?: Date
  revokedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class ApiKeyService {
  async create(orgId: string, name: string, expiresAt?: Date): Promise<{ key: string; doc: ApiKeyDoc }> {
    const { key, prefix, hash } = this.generateKey()
    const doc = await ApiKeyModel.create({ orgId, name, prefix, hash, expiresAt })
    return { key, doc }
  }

  async list(orgId: string): Promise<Omit<ApiKeyDoc, "hash">[]> {
    return ApiKeyModel.find({ orgId }).sort({ createdAt: -1 }).lean()
  }

  async revoke(orgId: string, id: string): Promise<ApiKeyDoc | null> {
    return ApiKeyModel.findOneAndUpdate({ _id: id, orgId }, { revokedAt: new Date() }, { new: true }).lean()
  }

  async regenerate(orgId: string, id: string): Promise<{ key: string; doc: ApiKeyDoc } | null> {
    const { key, prefix, hash } = this.generateKey()
    const doc = await ApiKeyModel.findOneAndUpdate({ _id: id, orgId }, { prefix, hash }, { new: true }).lean()
    if (!doc) return null
    return { key, doc }
  }

  async verify(key: string): Promise<ApiKeyDoc | null> {
    const hash = sha256(key)
    const doc = await ApiKeyModel.findOne({ hash, revokedAt: { $exists: false } }).lean()
    if (!doc) return null
    if (doc.expiresAt && new Date() > doc.expiresAt) return null
    return doc
  }

  private generateKey(): { key: string; prefix: string; hash: string } {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    const prefix = key.slice(0, 8)
    const hash = sha256(key)
    return { key, prefix, hash }
  }
}