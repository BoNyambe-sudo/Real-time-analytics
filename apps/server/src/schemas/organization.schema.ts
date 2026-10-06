import { Schema, model, models } from "mongoose"

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, maxlength: 64, match: /^[a-z0-9-]+$/ },
  },
  { timestamps: true, versionKey: false }
)

OrganizationSchema.index({ slug: 1 }, { unique: true })

export const OrganizationModel = models.Organization ?? model("Organization", OrganizationSchema)