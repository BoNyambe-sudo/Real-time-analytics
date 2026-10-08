"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useRealtimeStore } from "@/stores/useRealtimeStore";

interface TimeSeriesDataPoint {
  time: string;
  activeUsers: number;
  requestsPerSec: number;
  revenue: number;
  errorRate: number;
  latencyMs: number;
}

interface MetricDataPoint {
  ts: string;
  activeUsers: number;
  requestsPerSec: number;
  revenue: number;
  errorRate: number;
  latencyMs: number;
}

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  foreground: "hsl(var(--foreground))",
  mutedForeground: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  card: "hsl(var(--card))",
};

export function MetricsCharts() {
  const { timeseries } = useRealtimeStore();

  if (!timeseries || timeseries.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="h-64 sm:h-72" />
          </Card>
        ))}
      </div>
    );
  }

  const data: TimeSeriesDataPoint[] = timeseries.map((d: MetricDataPoint) => ({
    time: new Date(d.ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    activeUsers: d.activeUsers,
    requestsPerSec: d.requestsPerSec,
    revenue: d.revenue,
    errorRate: d.errorRate,
    latencyMs: d.latencyMs,
  }));

  const axisConfig = {
    stroke: CHART_COLORS.mutedForeground,
    tick: { fill: CHART_COLORS.mutedForeground, fontSize: 11 },
    interval: Math.max(1, Math.floor(data.length / 8)),
  };

  const gridConfig = {
    strokeDasharray: "3 3",
    stroke: CHART_COLORS.border,
  };

  const tooltipConfig = {
    contentStyle: {
      backgroundColor: CHART_COLORS.card,
      border: `1px solid ${CHART_COLORS.border}`,
      borderRadius: "8px",
    },
    labelStyle: { color: CHART_COLORS.foreground },
  };

  const gradientId = (name: string) => `color${name}`;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId("Users")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke={CHART_COLORS.primary}
                fill={`url(#${gradientId("Users")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests/sec</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Line
                type="monotone"
                dataKey="requestsPerSec"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Bar
                dataKey="revenue"
                fill={CHART_COLORS.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
