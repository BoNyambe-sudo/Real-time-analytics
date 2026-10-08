'use client';

import { useEffect } from 'react';
import { useRealtimeStore } from '@/stores/useRealtimeStore';
import { useMetricsSummary, useMetricsTimeseries } from '@/hooks/useMetrics';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { MetricsCharts } from '@/components/dashboard/metrics-charts';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from 'next-auth/react';
//import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: summary, isLoading } = useMetricsSummary();
  const { data: timeseries } = useMetricsTimeseries('24h');
  const { connect, joinOrg } = useSocket();
  const realtimeSummary = useRealtimeStore(state => state.summary);
  //const queryClient = useQueryClient();

  // Connect socket when session is available
  useEffect(() => {
    if (session?.user?.orgId) {
      connect();
      joinOrg(session.user.orgId);
    }
  }, [session?.user?.orgId, connect, joinOrg]);

  // Initialize realtime store with fetched timeseries data
  useEffect(() => {
    if (timeseries && timeseries.length > 0) {
      const { setTimeseries } = useRealtimeStore.getState();
      setTimeseries(timeseries);
    }
  }, [timeseries]);

  // Use realtime summary if available, otherwise fallback to React Query data
  const displaySummary = realtimeSummary || summary;

  if (isLoading && !displaySummary) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPICards summary={displaySummary} />
      <MetricsCharts />
    </div>
  );
}
