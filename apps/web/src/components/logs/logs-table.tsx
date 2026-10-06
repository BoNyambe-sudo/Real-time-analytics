"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useState, useCallback, useEffect, useRef } from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"

const LEVEL_COLORS: Record<string, string> = { info: "bg-blue-500/20 text-blue-400", warn: "bg-amber-500/20 text-amber-400", error: "bg-red-500/20 text-red-400" }

interface LogEntry {
  ts: string
  level: "info" | "warn" | "error"
  message: string
  path: string
  statusCode: number
  latencyMs: number
}

export function LogsTable() {
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState<"info" | "warn" | "error" | "">("")
  const [sort, setSort] = useState<"asc" | "desc">("desc")
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["logs", debouncedSearch, level, sort],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set("cursor", pageParam)
      params.set("limit", "50")
      params.set("sort", sort)
      if (level) params.set("level", level)
      if (debouncedSearch) params.set("q", debouncedSearch)
      const res = await fetch(`/api/logs?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch logs")
      return res.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  })

  const logs = data?.pages.flatMap((p) => p.data) || []

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 20,
  })

  const handleSort = () => setSort((s) => (s === "asc" ? "desc" : "asc"))

  if (isLoading) {
    return (
      <div className="h-[600px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="border rounded-md px-3 py-2 text-sm bg-background">
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <Button variant="outline" size="icon" onClick={handleSort} title={sort === "asc" ? "Sort ascending" : "Sort descending"}>
            {sort === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div ref={parentRef} className="h-[600px] overflow-auto border rounded-lg bg-background">
        <Table>
          <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
            <TableRow>
              <TableHead className="w-32">Time</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-48">Path</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <TableRow key={virtualRow.index} style={{ transform: `translateY(${virtualRow.start}px)` }}>
                <TableCell className="font-mono text-xs">{new Date(logs[virtualRow.index].ts).toLocaleTimeString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={LEVEL_COLORS[logs[virtualRow.index].level]}>{logs[virtualRow.index].level.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="max-w-[400px] truncate">{logs[virtualRow.index].message}</TableCell>
                <TableCell className="font-mono text-xs">{logs[virtualRow.index].path}</TableCell>
                <TableCell>{logs[virtualRow.index].statusCode}</TableCell>
                <TableCell>{logs[virtualRow.index].latencyMs}ms</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isFetchingNextPage && <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Load more
          </Button>
        </div>
      )}
    </div>
  )
}