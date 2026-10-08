import { Injectable } from "@nestjs/common"
import { AlertModel } from "../schemas/alert.schema.js"

export interface AlertDoc {
  _id: any
  orgId: any
  type: string
  message: string
  value: number
  threshold: number
  ts: Date
  acknowledgedAt?: Date
}

@Injectable()
export class AlertService {
  private readonly ALERT_COOLDOWN_MS = 5 * 60 * 1000

  async evaluate(orgId: string, metric: { errorRate: number; ts: Date }): Promise<AlertDoc | null> {
    if (metric.errorRate <= 5) return null

    const recentAlert = await AlertModel.findOne({
      orgId,
      type: "error_rate",
      acknowledgedAt: { $exists: false },
      ts: { $gte: new Date(Date.now() - this.ALERT_COOLDOWN_MS) },
    }).lean()

    if (recentAlert) return null

    const alert = await AlertModel.create({
      orgId,
      type: "error_rate",
      message: `Error rate ${metric.errorRate.toFixed(1)}% exceeded 5% threshold`,
      value: metric.errorRate,
      threshold: 5,
      ts: metric.ts,
    })
    return alert
  }

  async getAlerts(orgId: string, limit = 50): Promise<AlertDoc[]> {
    return AlertModel.find({ orgId }).sort({ ts: -1 }).limit(limit).lean()
  }

  async acknowledge(orgId: string, alertId: string): Promise<AlertDoc | null> {
    return AlertModel.findOneAndUpdate(
      { _id: alertId, orgId },
      { acknowledgedAt: new Date() },
      { new: true }
    ).lean()
  }
}