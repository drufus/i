import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminRoute } from './components/auth/AdminRoute';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Admin = React.lazy(() => import('./pages/Admin'));
const UserDetails = React.lazy(() => import('./pages/UserDetails'));
const IntegrationSetup = React.lazy(() => import('./pages/admin/IntegrationSetup'));
const IntegrationManage = React.lazy(() => import('./pages/admin/IntegrationManage'));

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        }
      >
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <AdminRoute>
                  <UserDetails />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/integrations/:integrationId/setup"
              element={
                <AdminRoute>
                  <IntegrationSetup />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/integrations/:integrationId/manage"
              element={
                <AdminRoute>
                  <IntegrationManage />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}