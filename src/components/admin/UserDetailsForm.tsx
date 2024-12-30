import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { createFormValidator, commonRules } from '../../utils/validation';
import { AppError } from '../../lib/errors';
import { User } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserDetailsFormProps {
  user: User;
  loading?: boolean;
  onSubmit: (data: UpdateUserData) => Promise<void>;
  onError?: (error: AppError) => void;
}

interface UpdateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  subscription_tier: User['subscription_tier'];
  status: 'active' | 'suspended' | 'deactivated';
  notes?: string;
}

const userDetailsValidator = createFormValidator<UpdateUserData>({
  email: {
    required: true,
    rules: [commonRules.email]
  },
  firstName: {
    required: true,
    rules: [{
      validate: (value) => value.length >= 2,
      message: 'First name must be at least 2 characters'
    }]
  },
  lastName: {
    required: true,
    rules: [{
      validate: (value) => value.length >= 2,
      message: 'Last name must be at least 2 characters'
    }]
  },
  role: { required: true },
  subscription_tier: { required: true },
  status: { required: true },
  notes: {
    rules: [{
      validate: (value) => !value || value.length <= 500,
      message: 'Notes must be less than 500 characters'
    }]
  }
});

export function UserDetailsForm({ 
  user, 
  loading: initialLoading = false, 
  onSubmit,
  onError
}: UserDetailsFormProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    role: user.role,
    subscription_tier: user.subscription_tier,
    status: user.status || 'active',
    notes: user.notes
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role,
      subscription_tier: user.subscription_tier,
      status: user.status || 'active',
      notes: user.notes
    });
    setIsDirty(false);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = userDetailsValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError(
            error instanceof Error ? error.message : 'Failed to update user',
            'UPDATE_USER_ERROR'
          );
      
      setErrors({ submit: appError.message });
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
    
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderField = (
    name: keyof UpdateUserData,
    label: string,
    type: string = 'text'
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name] as string}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        }`}
        disabled={loading}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {renderField('email', 'Email Address', 'email')}
        {renderField('firstName', 'First Name')}
        {renderField('lastName', 'Last Name')}

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label htmlFor="subscription_tier" className="block text-sm font-medium text-gray-700">
            Subscription Tier <span className="text-red-500">*</span>
          </label>
          <select
            id="subscription_tier"
            name="subscription_tier"
            value={formData.subscription_tier}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.subscription_tier ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          {errors.subscription_tier && (
            <p className="mt-1 text-sm text-red-600">{errors.subscription_tier}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.status ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes || ''}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.notes ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          {formData.notes?.length || 0}/500 characters
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          loading={loading}
          disabled={!isDirty || loading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}