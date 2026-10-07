"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardsProps {
  summary: {
    totalRevenue: number;
    activeUsers: number;
    errorRate: number;
    latencyMs: number;
  } | null;
}

export function KPICards({ summary }: KPICardsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: summary ? `$${summary.totalRevenue.toLocaleString()}` : "$0",
      icon: "💰",
      color: "bg-emerald-500/20 text-emerald-400",
    },
    {
      label: "Active Users",
      value: summary ? summary.activeUsers.toLocaleString() : "0",
      icon: "👥",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Error Rate",
      value: summary ? `${summary.errorRate.toFixed(1)}%` : "0%",
      icon: "⚠️",
      color: "bg-amber-500/20 text-amber-400",
    },
    {
      label: "Avg Latency",
      value: summary ? `${summary.latencyMs}ms` : "0ms",
      icon: "⚡",
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", card.color)}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
