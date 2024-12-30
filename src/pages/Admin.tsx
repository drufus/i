import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserSearch } from '../components/admin/UserSearch';
import { UserList } from '../components/admin/UserList';
import { AdminTabs } from '../components/admin/AdminTabs';
import { AdminIntegrationsList } from '../components/admin/integrations';
import { CreateUserModal } from '../components/admin/CreateUserModal';
import { Toast } from '../components/ui/Toast';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const { users, loading, error, searchUsers, createUser } = useAdminUsers();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'integrations'>('users');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  // Initial load of users
  useEffect(() => {
    if (activeTab === 'users') {
      searchUsers('');
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(search);
  };

  const handleCreateUser = async (userData: {
    email: string;
    password: string;
    role: 'user' | 'admin';
    subscription_tier: 'basic' | 'pro' | 'premium';
  }) => {
    try {
      await createUser(userData);
      setToast({
        message: 'User created successfully',
        type: 'success'
      });
      searchUsers(''); // Refresh the list
    } catch (error) {
      setToast({
        message: (error as Error).message,
        type: 'error'
      });
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <UserCog className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'users' ? (
          <>
            <UserSearch
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
            />
            <UserList
              users={users}
              loading={loading}
              error={error}
              onCreateUser={() => setShowCreateModal(true)}
            />
          </>
        ) : (
          <AdminIntegrationsList />
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}