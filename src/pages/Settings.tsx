import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { NicheSelector } from '../components/niches/NicheSelector';
import { usePostStore } from '../store/postStore';
import { ProfileForm } from '../components/settings/ProfileForm';
import { PasswordForm } from '../components/settings/PasswordForm';
import { IntegrationsList } from '../components/settings/IntegrationsList';
import { Toast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';

export default function Settings() {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const { posts } = usePostStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleProfileUpdate = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => {
    try {
      await updateProfile(data);
      setToast({
        message: 'Profile updated successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to update profile',
        type: 'error'
      });
    }
  };

  const handlePasswordUpdate = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      setToast({
        message: 'Password updated successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: (error as Error).message,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Account Settings
        </h3>
      </div>
      
      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Social Media Integrations
          </h3>
          <IntegrationsList />
        </div>
      </Card>

      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Profile Information
          </h3>
          <div className="mt-5">
            <ProfileForm
              initialData={{
                firstName: user?.first_name || '',
                lastName: user?.last_name || '',
                phone: user?.phone || '',
                addressLine1: user?.address_line1 || '',
                addressLine2: user?.address_line2 || '',
                city: user?.city || '',
                state: user?.state || '',
                postalCode: user?.postal_code || '',
                country: user?.country || ''
              }}
              onSubmit={handleProfileUpdate}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Change Password
          </h3>
          <div className="mt-5">
            <PasswordForm onSubmit={handlePasswordUpdate} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Content Niche
          </h3>
          <div className="mt-5">
            <NicheSelector />
          </div>
        </div>
      </Card>

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