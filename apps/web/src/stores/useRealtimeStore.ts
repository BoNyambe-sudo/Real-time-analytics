import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface RealtimeState {
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  latency: number
  summary: { totalRevenue: number; activeUsers: number; errorRate: number; latencyMs: number } | null
  timeseries: any[]
  alerts: any[]
  setConnectionStatus: (status: RealtimeState["connectionStatus"]) => void
  setLatency: (latency: number) => void
  setSummary: (summary: RealtimeState["summary"]) => void
  setTimeseries: (timeseries: any[]) => void
  addTimeseries: (points: any[]) => void
  addAlert: (alert: any) => void
  clearAlerts: () => void
}

export const useRealtimeStore = create<RealtimeState>()(
  subscribeWithSelector((set) => ({
    connectionStatus: "disconnected",
    latency: 0,
    summary: null,
    timeseries: [],
    alerts: [],
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setLatency: (latency) => set({ latency }),
    setSummary: (summary) => set({ summary }),
    setTimeseries: (timeseries) => set({ timeseries }),
    addTimeseries: (points) => set((state) => {
      const existing = new Map(state.timeseries.map((d) => [d.ts, d]))
      for (const p of points) existing.set(p.ts, p)
      return { timeseries: Array.from(existing.values()).sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()) }
    }),
    addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 100) })),
    clearAlerts: () => set({ alerts: [] }),
  }))
)