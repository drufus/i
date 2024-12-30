import React, { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Toast } from '../../../ui/Toast';
import type { SubscriptionPlan } from '../../../../types/subscription';

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan;
  onSubmit: (data: Partial<SubscriptionPlan>) => Promise<void>;
  onCancel: () => void;
}

export function SubscriptionPlanForm({ plan, onSubmit, onCancel }: SubscriptionPlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    tier: plan?.tier || 'basic',
    price: plan?.price?.toString() || '0',
    interval: plan?.interval || 'month',
    post_limit: plan?.post_limit?.toString() || '10',
    niche_limit: plan?.niche_limit?.toString() || '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        post_limit: parseInt(formData.post_limit, 10),
        niche_limit: parseInt(formData.niche_limit, 10)
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields remain the same, just update the field names */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tier</label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as SubscriptionPlan['tier'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Interval</label>
          <select
            value={formData.interval}
            onChange={(e) => setFormData(prev => ({ ...prev, interval: e.target.value as 'month' | 'year' }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Post Limit</label>
          <input
            type="number"
            min="1"
            value={formData.post_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, post_limit: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Niche Limit</label>
          <input
            type="number"
            min="1"
            value={formData.niche_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, niche_limit: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}