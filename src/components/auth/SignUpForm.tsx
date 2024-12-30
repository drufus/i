import React from 'react';
import { Button } from '../ui/Button';
import { createFormValidator, commonRules } from '../../utils/validation';
import { supabase } from '../../lib/supabase';
import { AppError, AuthError } from '../../lib/errors';

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
}

const signUpValidator = createFormValidator<SignUpData>({
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
  confirmPassword: {
    required: true,
    rules: [{
      validate: (value, formData: SignUpData) => value === formData.password,
      message: 'Passwords must match'
    }]
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
  acceptTerms: {
    required: true,
    rules: [{
      validate: (value) => value === true,
      message: 'You must accept the terms and conditions'
    }]
  }
});

export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const [formData, setFormData] = React.useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signUpValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) {
        throw new AuthError(authError.message);
      }

      if (!authData.user) {
        throw new AuthError('Failed to create user');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        // Cleanup: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new AuthError(profileError.message);
      }

      onSuccess?.();
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError(
            error instanceof Error ? error.message : 'Failed to sign up',
            'SIGNUP_ERROR'
          );
      
      setErrors({ submit: appError.message });
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

  const renderField = (
    name: keyof SignUpData,
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
        value={type === 'checkbox' ? undefined : (formData[name] as string)}
        checked={type === 'checkbox' ? (formData[name] as boolean) : undefined}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          errors[name] ? 'border-red-500' : ''
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
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

      <div className="space-y-4">
        {renderField('firstName', 'First Name')}
        {renderField('lastName', 'Last Name')}
        {renderField('email', 'Email', 'email')}
        {renderField('password', 'Password', 'password')}
        {renderField('confirmPassword', 'Confirm Password', 'password')}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="acceptTerms"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
              errors.acceptTerms ? 'border-red-500' : ''
            }`}
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
            I accept the terms and conditions
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>
        )}
      </div>

      <div>
        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </div>
    </form>
  );
}