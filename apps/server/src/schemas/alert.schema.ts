import { Schema, model } from "mongoose"
import mongoose from "mongoose"

const AlertSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Number, required: true },
    threshold: { type: Number, required: true },
    ts: { type: Date, required: true, index: true },
    acknowledgedAt: { type: Date },
  },
  { timestamps: false, versionKey: false }
)

AlertSchema.index({ ts: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })
AlertSchema.index({ orgId: 1, ts: -1 })
AlertSchema.index({ acknowledgedAt: 1 })

export const AlertModel = mongoose.models.Alert ?? model("Alert", AlertSchema)