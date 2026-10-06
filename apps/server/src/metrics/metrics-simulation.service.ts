import { Injectable, Inject } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { MetricModel } from "../schemas/metric.schema.js"
import { OrganizationModel } from "../schemas/organization.schema.js"
import { AlertService } from "../alerts/alert.service.js"
import { MetricsGateway } from "../gateway/metrics.gateway.js"
import { MONGOOSE_CONNECTION } from "../database/mongoose.module.js"
import type { Model } from "mongoose"

interface Org { _id: any }

@Injectable()
export class MetricsSimulationService {
  private orgs: Org[] = []
  private baseMetrics = new Map<string, { activeUsers: number; requestsPerSec: number; revenue: number; errorRate: number; latencyMs: number }>()

  constructor(
    @Inject(MONGOOSE_CONNECTION) private readonly mongoose: typeof import("mongoose"),
    private readonly alertService: AlertService,
    private readonly metricsGateway: MetricsGateway
  ) {}

  async onModuleInit() {
    this.orgs = (await OrganizationModel.find().lean()) as Org[]
    for (const org of this.orgs) {
      this.baseMetrics.set(org._id.toString(), {
        activeUsers: 1000 + Math.random() * 500,
        requestsPerSec: 200 + Math.random() * 100,
        revenue: 5000 + Math.random() * 2000,
        errorRate: 1 + Math.random() * 2,
        latencyMs: 50 + Math.random() * 30,
      })
    }
  }

  @Cron("*/2 * * * * *")
  async generateMetrics() {
    if (this.orgs.length === 0) return

    const batch: any[] = []
    const alerts: any[] = []

    for (const org of this.orgs) {
      const id = org._id.toString()
      const base = this.baseMetrics.get(id)!
      const jitter = (val: number, pct: number) => val * (1 + (Math.random() - 0.5) * pct)

      const activeUsers = Math.max(0, Math.round(jitter(base.activeUsers, 0.1)))
      const requestsPerSec = Math.max(0, Math.round(jitter(base.requestsPerSec, 0.15)))
      const revenue = Math.max(0, Math.round(jitter(base.revenue, 0.05) * 100) / 100)
      const errorRate = Math.min(100, Math.max(0, jitter(base.errorRate, 0.5)))
      const latencyMs = Math.max(1, Math.round(jitter(base.latencyMs, 0.2)))

      if (Math.random() < 0.02) {
        base.errorRate = Math.min(10, base.errorRate + 5 + Math.random() * 5)
      } else if (base.errorRate > 2) {
        base.errorRate = Math.max(1, base.errorRate - 0.2)
      }

      base.activeUsers = activeUsers
      base.requestsPerSec = requestsPerSec
      base.revenue = revenue
      base.errorRate = errorRate
      base.latencyMs = latencyMs

      const ts = new Date()
      batch.push({ orgId: id, ts, activeUsers, requestsPerSec, revenue, errorRate, latencyMs })

      if (errorRate > 5) {
        const alert = await this.alertService.evaluate(id, { errorRate, ts })
        if (alert) alerts.push(alert)
      }
    }

    if (batch.length > 0) {
      await MetricModel.insertMany(batch)

      for (const org of this.orgs) {
        const orgBatch = batch.filter((m) => m.orgId === org._id.toString())
        if (orgBatch.length > 0) {
          this.metricsGateway.emitToOrg(org._id.toString(), "metrics", orgBatch)
        }
      }
    }

    for (const alert of alerts) {
      const org = this.orgs.find((o) => o._id.toString() === alert.orgId)
      if (org) this.metricsGateway.emitToOrg(alert.orgId, "alert", alert)
    }
  }
}