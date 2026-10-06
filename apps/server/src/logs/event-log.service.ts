import { Injectable } from "@nestjs/common"
import { EventLogModel } from "../schemas/event-log.schema.js"

export interface LogsQuery {
  cursor?: string
  limit?: number
  sort?: "asc" | "desc"
  level?: "info" | "warn" | "error"
  q?: string
}

export interface LogsResult {
  data: any[]
  nextCursor?: string
  hasMore: boolean
}

@Injectable()
export class EventLogService {
  async getLogs(orgId: string, query: LogsQuery): Promise<LogsResult> {
    const { cursor, limit = 50, sort = "desc", level, q } = query

    const filter: any = { orgId }
    if (level) filter.level = level
    if (q) filter.$or = [{ message: { $regex: q, $options: "i" } }, { path: { $regex: q, $options: "i" } }]
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (!isNaN(cursorDate.getTime())) {
        filter.ts = sort === "desc" ? { $lt: cursorDate } : { $gt: cursorDate }
      }
    }

    const sortOrder = sort === "desc" ? -1 : 1
    const docs = await EventLogModel.find(filter).sort({ ts: sortOrder }).limit(limit + 1).lean()

    const hasMore = docs.length > limit
    const data = hasMore ? docs.slice(0, limit) : docs
    const nextCursor = data.length > 0 ? data[data.length - 1].ts.toISOString() : undefined

    return { data, nextCursor, hasMore }
  }
}