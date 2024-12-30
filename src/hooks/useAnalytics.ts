import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { AppError } from '../lib/errors';

interface UserActivity {
  timestamp: string;
  user: string;
  action: string;
  details?: Record<string, any>;
}

interface UserSession {
  id: string;
  user: string;
  startTime: string;
  duration: string;
  status: 'active' | 'idle' | 'ended';
  lastActivity: string;
}

interface SystemEvent {
  id: string;
  type: 'error' | 'warning' | 'info';
  timestamp: string;
  message: string;
  details?: Record<string, any>;
}

interface AnalyticsData {
  activeUsers: number;
  newUsersToday: number;
  retentionRate: number;
  activeSessions: number;
  userSessions: UserSession[];
  recentActivity: UserActivity[];
  systemEvents: SystemEvent[];
  metrics: {
    dailyActiveUsers: number[];
    weeklyActiveUsers: number[];
    monthlyActiveUsers: number[];
    conversionRate: number;
    churnRate: number;
  };
}

interface UseAnalyticsReturn {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: AppError | null;
  getUserActivity: (userId: string, startDate?: Date, endDate?: Date) => Promise<UserActivity[]>;
  getActiveUsers: (period: 'daily' | 'weekly' | 'monthly') => Promise<number>;
  getRetentionMetrics: (cohortDate: Date) => Promise<{
    cohortSize: number;
    retentionByWeek: number[];
  }>;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const { supabase } = useSupabase();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active users
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('users')
        .select('id')
        .eq('status', 'active');

      if (activeUsersError) throw activeUsersError;

      // Fetch new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: newUsersData, error: newUsersError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', today.toISOString());

      if (newUsersError) throw newUsersError;

      // Fetch user sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (activityError) throw activityError;

      // Fetch system events
      const { data: eventsData, error: eventsError } = await supabase
        .from('system_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      // Calculate retention rate (example: 30-day retention)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: retentionData, error: retentionError } = await supabase
        .from('users')
        .select('id, last_login')
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (retentionError) throw retentionError;

      const activeInLast30Days = retentionData.filter(user => 
        user.last_login && new Date(user.last_login) > thirtyDaysAgo
      ).length;

      const retentionRate = retentionData.length > 0
        ? (activeInLast30Days / retentionData.length) * 100
        : 0;

      // Transform the data
      const analyticsData: AnalyticsData = {
        activeUsers: activeUsersData.length,
        newUsersToday: newUsersData.length,
        retentionRate,
        activeSessions: sessionsData.filter(s => s.status === 'active').length,
        userSessions: sessionsData.map(session => ({
          id: session.id,
          user: session.user_email,
          startTime: session.start_time,
          duration: formatDuration(new Date(session.start_time)),
          status: session.status,
          lastActivity: session.last_activity
        })),
        recentActivity: activityData.map(activity => ({
          timestamp: activity.timestamp,
          user: activity.user_email,
          action: activity.action,
          details: activity.details
        })),
        systemEvents: eventsData.map(event => ({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          message: event.message,
          details: event.details
        })),
        metrics: {
          dailyActiveUsers: [], // To be implemented
          weeklyActiveUsers: [], // To be implemented
          monthlyActiveUsers: [], // To be implemented
          conversionRate: 0, // To be implemented
          churnRate: 0 // To be implemented
        }
      };

      setAnalytics(analyticsData);
    } catch (err) {
      setError(
        err instanceof AppError
          ? err
          : new AppError(
              err instanceof Error ? err.message : 'Failed to fetch analytics',
              'ANALYTICS_ERROR'
            )
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserActivity = async (
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UserActivity[]> => {
    try {
      let query = supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(activity => ({
        timestamp: activity.timestamp,
        user: activity.user_email,
        action: activity.action,
        details: activity.details
      }));
    } catch (err) {
      throw new AppError(
        err instanceof Error ? err.message : 'Failed to fetch user activity',
        'USER_ACTIVITY_ERROR'
      );
    }
  };

  const getActiveUsers = async (period: 'daily' | 'weekly' | 'monthly'): Promise<number> => {
    try {
      const date = new Date();
      switch (period) {
        case 'daily':
          date.setDate(date.getDate() - 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() - 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('user_activity')
        .select('user_id')
        .gte('timestamp', date.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Get unique users
      const uniqueUsers = new Set(data.map(activity => activity.user_id));
      return uniqueUsers.size;
    } catch (err) {
      throw new AppError(
        err instanceof Error ? err.message : 'Failed to fetch active users',
        'ACTIVE_USERS_ERROR'
      );
    }
  };

  const getRetentionMetrics = async (cohortDate: Date): Promise<{
    cohortSize: number;
    retentionByWeek: number[];
  }> => {
    try {
      // Get users who signed up in the cohort week
      const cohortEndDate = new Date(cohortDate);
      cohortEndDate.setDate(cohortEndDate.getDate() + 7);

      const { data: cohortUsers, error: cohortError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', cohortDate.toISOString())
        .lt('created_at', cohortEndDate.toISOString());

      if (cohortError) throw cohortError;

      const cohortSize = cohortUsers.length;
      const retentionByWeek: number[] = [];

      // Calculate retention for 8 weeks
      for (let week = 1; week <= 8; week++) {
        const weekStart = new Date(cohortDate);
        weekStart.setDate(weekStart.getDate() + (week * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const { data: activeUsers, error: activeError } = await supabase
          .from('user_activity')
          .select('user_id')
          .in('user_id', cohortUsers.map(u => u.id))
          .gte('timestamp', weekStart.toISOString())
          .lt('timestamp', weekEnd.toISOString());

        if (activeError) throw activeError;

        const uniqueActiveUsers = new Set(activeUsers.map(a => a.user_id));
        retentionByWeek.push((uniqueActiveUsers.size / cohortSize) * 100);
      }

      return {
        cohortSize,
        retentionByWeek
      };
    } catch (err) {
      throw new AppError(
        err instanceof Error ? err.message : 'Failed to fetch retention metrics',
        'RETENTION_METRICS_ERROR'
      );
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    getUserActivity,
    getActiveUsers,
    getRetentionMetrics,
    refreshAnalytics: fetchAnalytics
  };
}

function formatDuration(startTime: Date): string {
  const duration = Date.now() - startTime.getTime();
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}