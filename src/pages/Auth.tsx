import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useSupabaseMutation } from '../hooks/useSupabase';
import { AuthError, ValidationError } from '../lib/errors';
import { supabase } from '../lib/supabase';

interface AuthFormData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  session: any;
  error?: Error;
}

export function Auth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: ''
  });
  
  const { mutate: signIn, loading, error } = useSupabaseMutation<AuthResponse>(
    async () => {
      // Validate input
      if (!formData.email) {
        throw new ValidationError('Email is required');
      }
      if (!formData.password) {
        throw new ValidationError('Password is required');
      }
      if (formData.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long');
      }

      return await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
    },
    {
      onSuccess: () => {
        navigate('/');
      },
      retries: 2,
      retryDelay: 1000,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn();
    } catch (err) {
      // Error is already handled by useSupabaseMutation
      console.error('Sign in error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error.message}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                loading={loading}
                className="group relative w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}