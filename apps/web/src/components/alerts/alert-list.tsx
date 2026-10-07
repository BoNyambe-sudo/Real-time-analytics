"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  _id: string;
  type: string;
  message: string;
  value: number;
  threshold: number;
  ts: string;
  acknowledgedAt?: string;
}

export function AlertList() {
  const { data: alerts = [], refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const handleAcknowledge = async (id: string) => {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Alert acknowledged");
      refetch();
    } else toast.error("Failed to acknowledge");
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No alerts</h3>
          <p className="text-muted-foreground">
            All systems operating normally
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert: Alert) => (
        <Card key={alert._id} className="border-l-4 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium">{alert.message}</span>
                  {!alert.acknowledgedAt && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                  {alert.acknowledgedAt && (
                    <Badge variant="secondary">Acknowledged</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Value: {alert.value}% • Threshold: {alert.threshold}% •{" "}
                  {new Date(alert.ts).toLocaleString()}
                </p>
              </div>
              {!alert.acknowledgedAt && (
                <Button size="sm" onClick={() => handleAcknowledge(alert._id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Acknowledge
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
