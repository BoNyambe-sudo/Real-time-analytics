"use client"

import { useRealtimeStore } from "@/stores/useRealtimeStore"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { MetricsCharts } from "@/components/dashboard/metrics-charts"

export default function DashboardPage() {
  const { summary } = useRealtimeStore()

  if (!summary) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />)}</div>

  return (
    <div className="space-y-6">
      <KPICards summary={summary} />
      <MetricsCharts />
    </div>
  )
}