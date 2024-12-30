import React from 'react';
import { PostAnalytics } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart2 
} from 'lucide-react';

interface MetricsGridProps {
  metrics: PostAnalytics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const items = [
    {
      label: 'Total Posts',
      value: metrics.totalPosts,
      icon: BarChart2,
      gradient: 'from-blue-500 to-blue-600',
      lightGradient: 'from-blue-50 to-blue-100',
    },
    {
      label: 'Posted',
      value: metrics.postedPosts,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
      lightGradient: 'from-emerald-50 to-emerald-100',
    },
    {
      label: 'Scheduled',
      value: metrics.scheduledPosts,
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      lightGradient: 'from-amber-50 to-amber-100',
    },
    {
      label: 'Failed',
      value: metrics.failedPosts,
      icon: AlertCircle,
      gradient: 'from-rose-500 to-rose-600',
      lightGradient: 'from-rose-50 to-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, gradient, lightGradient }) => (
        <Card key={label} className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  {value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${lightGradient}`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}