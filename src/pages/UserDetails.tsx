import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { UserDetailsForm } from '../components/admin/UserDetailsForm';
import { Card } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, loading, error, updateUserNiche } = useUser(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-700">Failed to load user: {error?.message || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      </div>

      <Card>
        <UserDetailsForm user={user} onUpdateNiche={updateUserNiche} />
      </Card>
    </div>
  );
}