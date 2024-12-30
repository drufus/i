import React from 'react';
import { Button } from '../ui/Button';
import { createFormValidator, commonRules } from '../../utils/validation';

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ProfileFormProps {
  initialData: ProfileData;
  onSubmit: (data: ProfileData) => Promise<void>;
}

const profileValidator = createFormValidator<ProfileData>({
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
  phone: {
    required: true,
    rules: [commonRules.phone]
  },
  addressLine1: {
    required: true,
    rules: [{
      validate: (value) => value.length >= 5,
      message: 'Address must be at least 5 characters'
    }]
  },
  city: { required: true },
  state: { required: true },
  postalCode: {
    required: true,
    rules: [commonRules.postalCode]
  },
  country: { required: true }
});

export function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const [formData, setFormData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = profileValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const renderField = (
    name: keyof ProfileData,
    label: string,
    type: string = 'text',
    required: boolean = true
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name] || ''}
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
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {renderField('firstName', 'First Name')}
        {renderField('lastName', 'Last Name')}
        {renderField('phone', 'Phone Number', 'tel')}
        {renderField('addressLine1', 'Address Line 1')}
        {renderField('addressLine2', 'Address Line 2', 'text', false)}
        {renderField('city', 'City')}
        {renderField('state', 'State')}
        {renderField('postalCode', 'Postal Code')}
        {renderField('country', 'Country')}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}