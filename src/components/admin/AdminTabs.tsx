import React, { useState, useEffect } from 'react';
import { Users, Settings, Activity, BarChart2, Key } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserList } from './UserList';
import { IntegrationsList } from './integrations/IntegrationsList';
import { SubscriptionManager } from './SubscriptionManager';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import ExcelJS from 'exceljs';

type Tab = 'users' | 'analytics' | 'activity' | 'integrations' | 'subscriptions';

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [retentionData, setRetentionData] = useState<{ cohortSize: number; retentionByWeek: number[] } | null>(null);
  const { users, loading: usersLoading, error: usersError, updateUser, deleteUser, bulkAction } = useAdminUsers();
  const { 
    analytics, 
    loading: analyticsLoading, 
    error: analyticsError,
    getUserActivity,
    getActiveUsers,
    getRetentionMetrics
  } = useAnalytics();

  useEffect(() => {
    if (activeTab === 'analytics') {
      // Get retention data for the last 8 weeks
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (8 * 7));
      getRetentionMetrics(startDate).then(setRetentionData);
    }
  }, [activeTab]);

  const tabs: TabItem[] = [
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Key className="w-5 h-5" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderAnalyticsDashboard = () => {
    if (analyticsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="text-red-600 p-4">
          {analyticsError.message}
        </div>
      );
    }

    const activeUsers = analytics?.activeUsers || 0;
    const totalUsers = users?.length || 0;
    const retentionRate = analytics?.retentionRate || 0;
    const newUsersToday = analytics?.newUsersToday || 0;

    // Prepare activity data for the chart
    const activityData = analytics?.recentActivity?.map(activity => ({
      time: new Date(activity.timestamp).toLocaleTimeString(),
      actions: 1,
      user: activity.user
    })) || [];

    // Prepare retention data for the chart
    const retentionChartData = retentionData?.retentionByWeek.map((rate, week) => ({
      week: `Week ${week + 1}`,
      retention: rate
    })) || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="mt-2 text-3xl font-semibold">{activeUsers}</p>
            <p className="mt-2 text-sm text-gray-600">
              {((activeUsers / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-semibold">{totalUsers}</p>
            <p className="mt-2 text-sm text-gray-600">
              +{newUsersToday} today
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Retention Rate</h3>
            <p className="mt-2 text-3xl font-semibold">{retentionRate}%</p>
            <p className="mt-2 text-sm text-gray-600">
              30-day rolling average
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
            <p className="mt-2 text-3xl font-semibold">{analytics?.activeSessions || 0}</p>
            <p className="mt-2 text-sm text-gray-600">
              Current online users
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">User Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="actions" fill="#4F46E5" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">User Retention</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
                <span className="text-gray-900">{activity.user}</span>
                <span className="text-gray-600">{activity.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderActivityMonitoring = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">User Sessions</h3>
          <div className="space-y-4">
            {analytics?.userSessions?.map((session, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{session.user}</p>
                  <p className="text-sm text-gray-500">
                    Started: {new Date(session.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Duration: {session.duration}
                  </p>
                  <p className={`text-sm ${
                    session.status === 'active' ? 'text-green-600' :
                    session.status === 'idle' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {session.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">System Events</h3>
          <div className="space-y-4">
            {analytics?.systemEvents?.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  event.type === 'error' ? 'bg-red-100 text-red-800' :
                  event.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {event.type}
                </span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                <span className="text-gray-900">{event.message}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'users' && (
          <UserList
            users={users}
            loading={usersLoading}
            error={usersError}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onBulkAction={bulkAction}
          />
        )}
        {activeTab === 'analytics' && renderAnalyticsDashboard()}
        {activeTab === 'activity' && renderActivityMonitoring()}
        {activeTab === 'integrations' && <IntegrationsList />}
        {activeTab === 'subscriptions' && <SubscriptionManager />}
      </div>
    </div>
  );
}