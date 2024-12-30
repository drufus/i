import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createFormValidator, commonRules } from '../../utils/validation';
import { AppError } from '../../lib/errors';
import { User } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData) => Promise<void>;
  onError?: (error: AppError) => void;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  subscription_tier: User['subscription_tier'];
}

const createUserValidator = createFormValidator<CreateUserData>({
  email: {
    required: true,
    rules: [commonRules.email]
  },
  password: {
    required: true,
    rules: [
      commonRules.password,
      {
        validate: (value) => /[A-Z]/.test(value),
        message: 'Password must contain at least one uppercase letter'
      },
      {
        validate: (value) => /[0-9]/.test(value),
        message: 'Password must contain at least one number'
      }
    ]
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
  subscription_tier: { required: true }
});

export function CreateUserModal({ isOpen, onClose, onSubmit, onError }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    subscription_tier: 'basic'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = createUserValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError(
            error instanceof Error ? error.message : 'Failed to create user',
            'CREATE_USER_ERROR'
          );
      
      setErrors({ submit: appError.message });
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (!isOpen) return null;

  const renderField = (
    name: keyof CreateUserData,
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
        value={formData[name]}
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Create New User
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Fill in the information below to create a new user account.
              </p>
            </div>

            {errors.submit && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {renderField('email', 'Email Address', 'email')}
              {renderField('password', 'Password', 'password')}
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
            </div>

            <div className="mt-8 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                loading={loading}
                className="w-full sm:w-auto sm:ml-3"
              >
                Create User
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}