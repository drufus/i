import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricsGrid } from './MetricsGrid';
import { PlatformBreakdown } from './PlatformBreakdown';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export function AnalyticsDashboard() {
  const user = useAuthStore(state => state.user);
  const { metrics, loading, error } = useAnalytics(user?.id ?? null);

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-700">Failed to load analytics: {error.message}</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <MetricsGrid metrics={metrics} />
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Platform Performance</h3>
        </CardHeader>
        <CardContent>
          <PlatformBreakdown platforms={metrics.platforms} />
        </CardContent>
      </Card>
    </div>
  );
}