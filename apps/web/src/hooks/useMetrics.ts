import { useQuery } from "@tanstack/react-query";

export function useMetricsSummary() {
  return useQuery({
    queryKey: ["metrics", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/metrics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    refetchInterval: 5000,
    staleTime: 5000,
  });
}

export function useMetricsTimeseries(range: "1h" | "24h" | "7d" = "24h") {
  return useQuery({
    queryKey: ["metrics", "timeseries", range],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/timeseries?range=${range}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch timeseries");
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 30000,
  });
}
