import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface MetricDataPoint {
  ts: string;
  activeUsers: number;
  requestsPerSec: number;
  revenue: number;
  errorRate: number;
  latencyMs: number;
}

interface AlertData {
  _id: string;
  type: string;
  message: string;
  value: number;
  threshold: number;
  ts: string;
  acknowledgedAt?: string;
}

interface RealtimeState {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  latency: number;
  summary: {
    totalRevenue: number;
    activeUsers: number;
    errorRate: number;
    latencyMs: number;
  } | null;
  timeseries: MetricDataPoint[];
  alerts: AlertData[];
  setConnectionStatus: (status: RealtimeState['connectionStatus']) => void;
  setLatency: (latency: number) => void;
  setSummary: (summary: RealtimeState['summary']) => void;
  setTimeseries: (timeseries: MetricDataPoint[]) => void;
  addTimeseries: (points: MetricDataPoint[]) => void;
  addAlert: (alert: AlertData) => void;
  clearAlerts: () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  subscribeWithSelector(set => ({
    connectionStatus: 'disconnected',
    latency: 0,
    summary: null,
    timeseries: [],
    alerts: [],
    setConnectionStatus: status => set({ connectionStatus: status }),
    setLatency: latency => set({ latency }),
    setSummary: summary => set({ summary }),
    setTimeseries: timeseries => set({ timeseries }),
    addTimeseries: points =>
      set(state => {
        const existing = new Map(state.timeseries.map(d => [d.ts, d]));
        for (const p of points) existing.set(p.ts, p);
        return {
          timeseries: Array.from(existing.values()).sort(
            (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
          ),
        };
      }),
    addAlert: alert => set(state => ({ alerts: [alert, ...state.alerts].slice(0, 100) })),
    clearAlerts: () => set({ alerts: [] }),
  }))
);
