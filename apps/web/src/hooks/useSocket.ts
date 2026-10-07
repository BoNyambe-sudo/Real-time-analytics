"use client"

import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useRealtimeStore } from "@/stores/useRealtimeStore"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { env } from "@/lib/env"

let socket: Socket | null = null

export function useSocket(): { socket: Socket | null; connect: () => void; disconnect: () => void; joinOrg: (orgId: string) => void; leaveOrg: (orgId: string) => void; ping: () => void } {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { setConnectionStatus, setLatency, setSummary, addTimeseries, addAlert } = useRealtimeStore()
  const reconnectTimeoutRef = useRef<number | null>(null)
  const socketTokenRef = useRef<string | null>(null)

  const fetchSocketToken = useCallback(async () => {
    if (!session?.user?.orgId) return null
    try {
      const res = await fetch("/api/socket-token", { credentials: "include" })
      if (!res.ok) return null
      const data = await res.json()
      return data.token
    } catch {
      return null
    }
  }, [session?.user?.orgId])

  const connect = useCallback(async () => {
    if (socket?.connected) return

    const token = await fetchSocketToken()
    if (!token) {
      console.warn("No socket token available, skipping connection")
      return
    }
    socketTokenRef.current = token

    // Connect directly to the socket server (not through Next.js rewrite)
    const serverUrl = env.NEXT_PUBLIC_SERVER_URL
    socket = io(serverUrl, { 
      path: "/socket.io", 
      transports: ["polling", "websocket"],
      withCredentials: false,
      query: { token },
    })

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
  }, [fetchSocketToken, setConnectionStatus, setLatency, setSummary, addTimeseries, addAlert])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    socket?.disconnect()
    socket = null
    socketTokenRef.current = null
    setConnectionStatus("disconnected")
  }, [setConnectionStatus])

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