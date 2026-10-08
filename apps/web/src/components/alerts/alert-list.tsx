"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Loader2, Bell } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const { data: alerts = [], isLoading, refetch } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts/${id}/acknowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to acknowledge alert");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setAcknowledgingId(null);
    },
    onError: () => {
      toast.error("Failed to acknowledge alert");
      setAcknowledgingId(null);
    },
  });

  const handleAcknowledge = (id: string) => {
    setAcknowledgingId(id);
    acknowledgeMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
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
      {alerts.map((alert: Alert) => {
        const isAcknowledging = acknowledgingId === alert._id;
        return (
          <Card key={alert._id} className="border-l-4 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <span className="font-medium truncate">{alert.message}</span>
                    {!alert.acknowledgedAt && (
                      <Badge variant="destructive" className="flex-shrink-0">Active</Badge>
                    )}
                    {alert.acknowledgedAt && (
                      <Badge variant="secondary" className="flex-shrink-0">Acknowledged</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Value: {alert.value}% • Threshold: {alert.threshold}% •{" "}
                    {new Date(alert.ts).toLocaleString()}
                  </p>
                </div>
                {!alert.acknowledgedAt && (
                  <Button
                    size="sm"
                    onClick={() => handleAcknowledge(alert._id)}
                    disabled={isAcknowledging || acknowledgeMutation.isPending}
                    className="flex-shrink-0"
                  >
                    {isAcknowledging ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
