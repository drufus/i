import React, { useState } from 'react';
import { Button } from '../../../ui/Button';
import { useStripeConfig } from '../../../../hooks/useStripeConfig';
import { STRIPE_CONFIG } from '../../../../config/stripe';

interface ApiKeyFormProps {
  environment?: 'development' | 'production';
  onSuccess?: () => void;
}

export function ApiKeyForm({ 
  environment = STRIPE_CONFIG.ENVIRONMENTS.PRODUCTION,
  onSuccess 
}: ApiKeyFormProps) {
  const { updateConfig, loading, error } = useStripeConfig(environment);
  const [formData, setFormData] = useState({
    publicKey: '',
    secretKey: '',
    webhookSecret: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to update API keys:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Public Key
        </label>
        <input
          type="text"
          value={formData.publicKey}
          onChange={(e) => setFormData(prev => ({ ...prev, publicKey: e.target.value }))}
          placeholder="pk_..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Secret Key
        </label>
        <input
          type="password"
          value={formData.secretKey}
          onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
          placeholder="sk_..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Webhook Secret
        </label>
        <input
          type="password"
          value={formData.webhookSecret}
          onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
          placeholder="whsec_..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save API Keys
        </Button>
      </div>
    </form>
  );
}