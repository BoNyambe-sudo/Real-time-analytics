import { Schema, model } from "mongoose"
import mongoose from "mongoose"

const MetricSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    ts: { type: Date, required: true },
    activeUsers: { type: Number, required: true, min: 0 },
    requestsPerSec: { type: Number, required: true, min: 0 },
    revenue: { type: Number, required: true, min: 0 },
    errorRate: { type: Number, required: true, min: 0, max: 100 },
    latencyMs: { type: Number, required: true, min: 0 },
  },
  { timestamps: false, versionKey: false }
)

MetricSchema.index({ ts: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })
MetricSchema.index({ orgId: 1, ts: -1 })

export const MetricModel = mongoose.models.Metric ?? model("Metric", MetricSchema)