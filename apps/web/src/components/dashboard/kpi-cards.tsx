"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, Users, AlertTriangle, Zap } from "lucide-react";

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
      Icon: DollarSign,
      color: "bg-emerald-500/20 text-emerald-400",
    },
    {
      label: "Active Users",
      value: summary ? summary.activeUsers.toLocaleString() : "0",
      Icon: Users,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Error Rate",
      value: summary ? `${summary.errorRate.toFixed(1)}%` : "0%",
      Icon: AlertTriangle,
      color: "bg-amber-500/20 text-amber-400",
    },
    {
      label: "Avg Latency",
      value: summary ? `${summary.latencyMs}ms` : "0ms",
      Icon: Zap,
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground truncate">{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{card.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl flex-shrink-0", card.color)}>
                <card.Icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
