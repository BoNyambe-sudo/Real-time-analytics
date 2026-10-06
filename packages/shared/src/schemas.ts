import { z } from "zod"

export const organizationSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
})

export const userSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().max(255),
  password: z.string().min(8),
  role: z.enum(["admin", "viewer"]),
  orgId: z.string(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const metricSchema = z.object({
  orgId: z.string(),
  ts: z.coerce.date(),
  activeUsers: z.number().int().min(0),
  requestsPerSec: z.number().min(0),
  revenue: z.number().min(0),
  errorRate: z.number().min(0).max(100),
  latencyMs: z.number().min(0),
})

export const eventLogSchema = z.object({
  orgId: z.string(),
  ts: z.coerce.date(),
  level: z.enum(["info", "warn", "error"]),
  message: z.string().max(2000),
  path: z.string().max(500),
  statusCode: z.number().int(),
  latencyMs: z.number().min(0),
  meta: z.record(z.string(), z.unknown()).optional(),
})

export const apiKeySchema = z.object({
  orgId: z.string(),
  name: z.string().min(1).max(120),
  expiresAt: z.coerce.date().optional(),
})

export const alertSchema = z.object({
  orgId: z.string(),
  type: z.string(),
  message: z.string(),
  value: z.number(),
  threshold: z.number(),
  ts: z.coerce.date(),
})

export const logsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  sort: z.enum(["asc", "desc"]).default("desc"),
  level: z.enum(["info", "warn", "error"]).optional(),
  q: z.string().optional(),
})

export const timeseriesQuerySchema = z.object({
  range: z.enum(["1h", "24h", "7d"]).default("24h"),
})

export const createApiKeyInputSchema = z.object({
  name: z.string().min(1).max(120),
  expiresAt: z.coerce.date().optional(),
})

export const acknowledgeAlertSchema = z.object({
  id: z.string(),
})

export type OrganizationInput = z.infer<typeof organizationSchema>
export type UserInput = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type MetricInput = z.infer<typeof metricSchema>
export type EventLogInput = z.infer<typeof eventLogSchema>
export type ApiKeyInput = z.infer<typeof apiKeySchema>
export type AlertInput = z.infer<typeof alertSchema>
export type LogsQuery = z.infer<typeof logsQuerySchema>
export type TimeseriesQuery = z.infer<typeof timeseriesQuerySchema>
export type CreateApiKeyInput = z.infer<typeof createApiKeyInputSchema>