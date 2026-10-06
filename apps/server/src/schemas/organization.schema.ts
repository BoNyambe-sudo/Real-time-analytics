import { Schema, model } from "mongoose"
import mongoose from "mongoose"

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, maxlength: 64, match: /^[a-z0-9-]+$/ },
  },
  { timestamps: true, versionKey: false }
)

OrganizationSchema.index({ slug: 1 }, { unique: true })

export const OrganizationModel = mongoose.models.Organization ?? model("Organization", OrganizationSchema)