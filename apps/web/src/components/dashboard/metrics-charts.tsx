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

// Dark mode colors from design system (OKLCH converted to RGB)
const CHART_COLORS = {
  // Text colors
  foreground: "#fbfbfb",        // oklch(0.985 0 0)
  mutedForeground: "#b4b4b4",   // oklch(0.708 0 0)
  // Border/grid
  border: "#4d4d4d",            // oklch(0.3 0 0)
  // Card background
  card: "#343434",              // oklch(0.205 0 0)
  // Chart data series colors (from design system --chart-1 to --chart-5)
  chart1: "#7c8fff",            // oklch(0.488 0.243 264.376) - blue
  chart2: "#6fe8c7",            // oklch(0.696 0.17 162.48) - teal
  chart3: "#f5e07b",            // oklch(0.769 0.188 70.08) - yellow
  chart4: "#d08fff",            // oklch(0.627 0.265 303.9) - purple
  chart5: "#f58c8c",            // oklch(0.645 0.246 16.439) - red
};

export function MetricsCharts() {
  const { timeseries } = useRealtimeStore();

  if (!timeseries || timeseries.length === 0) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
    interval: Math.max(1, Math.floor(data.length / 6)),
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

  const chartMargin = { top: 10, right: 20, left: -10, bottom: 10 };

  const gradientId = (name: string) => `color${name}`;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72 p-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={chartMargin}>
              <defs>
                <linearGradient id={gradientId("Users")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.chart1} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.chart1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke={CHART_COLORS.chart1}
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
        <CardContent className="h-64 sm:h-72 p-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chartMargin}>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Line
                type="monotone"
                dataKey="requestsPerSec"
                stroke={CHART_COLORS.chart2}
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
        <CardContent className="h-64 sm:h-72 p-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartMargin}>
              <CartesianGrid {...gridConfig} />
              <XAxis dataKey="time" {...axisConfig} />
              <YAxis {...axisConfig} />
              <Tooltip {...tooltipConfig} />
              <Bar
                dataKey="revenue"
                fill={CHART_COLORS.chart3}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
