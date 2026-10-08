import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';

const EventLogSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    ts: { type: Date, required: true },
    level: { type: String, enum: ['info', 'warn', 'error'], required: true },
    message: { type: String, required: true, maxlength: 2000 },
    path: { type: String, required: true, maxlength: 500 },
    statusCode: { type: Number, required: true },
    latencyMs: { type: Number, required: true, min: 0 },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: false, versionKey: false }
);

EventLogSchema.index({ ts: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
EventLogSchema.index({ orgId: 1, ts: -1 });
EventLogSchema.index({ level: 1 });

export const EventLogModel = mongoose.models.EventLog ?? model('EventLog', EventLogSchema);
