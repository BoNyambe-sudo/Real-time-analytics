"use client"

import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useRealtimeStore } from "@/stores/useRealtimeStore"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

let socket: Socket | null = null

export function useSocket(): { socket: Socket | null; connect: () => void; disconnect: () => void; joinOrg: (orgId: string) => void; leaveOrg: (orgId: string) => void; ping: () => void } {
  const queryClient = useQueryClient()
  const { setConnectionStatus, setLatency, setSummary, addTimeseries, addAlert } = useRealtimeStore()
  const reconnectTimeoutRef = useRef<number | null>(null)

  const connect = useCallback(() => {
    if (socket?.connected) return

    socket = io(window.location.origin, { path: "/socket.io", transports: ["polling", "websocket"], withCredentials: true })

    socket.on("connect", () => {
      setConnectionStatus("connected")
      console.log("Socket connected")
    })

    socket.on("disconnect", (reason) => {
      setConnectionStatus("disconnected")
      console.log("Socket disconnected:", reason)
      if (reason === "io server disconnect") return
      reconnectTimeoutRef.current = window.setTimeout(connect, 2000)
    })

    socket.on("connect_error", (err) => {
      setConnectionStatus("error")
      console.error("Socket connection error:", err)
      reconnectTimeoutRef.current = window.setTimeout(connect, 5000)
    })

    socket.on("connected", (data) => {
      if (data.latency >= 0) setLatency(data.latency)
      if (data.orgId) socket?.emit("join:org", { orgId: data.orgId })
    })

    socket.on("metrics", (batch) => {
      addTimeseries(batch)
      if (batch.length > 0) {
        const latest = batch[batch.length - 1]
        setSummary({
          totalRevenue: latest.revenue,
          activeUsers: latest.activeUsers,
          errorRate: latest.errorRate,
          latencyMs: latest.latencyMs,
        })
      }
    })

    socket.on("alert", (alert) => {
      addAlert(alert)
      toast.error(alert.message, { description: `Value: ${alert.value}% (threshold: ${alert.threshold}%)`, duration: 10000 })
    })

    socket.on("logs", (logs) => {
      queryClient.invalidateQueries({ queryKey: ["logs"] })
    })
  }, [setConnectionStatus, setLatency, setSummary, addTimeseries, addAlert, queryClient])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    socket?.disconnect()
    socket = null
    setConnectionStatus("disconnected")
  }, [setConnectionStatus])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const joinOrg = useCallback((orgId: string) => {
    socket?.emit("join:org", { orgId })
  }, [])

  const leaveOrg = useCallback((orgId: string) => {
    socket?.emit("leave:org", { orgId })
  }, [])

  const ping = useCallback(() => {
    const ts = Date.now()
    socket?.emit("ping", { ts }, (response: { ts: number; serverTs: number }) => {
      setLatency(Date.now() - response.ts)
    })
  }, [setLatency])

  return { socket, connect, disconnect, joinOrg, leaveOrg, ping }
}