import React, { useState } from 'react';
import { SubscriptionPlan } from '../../types/subscription';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface PlanEditorProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onUpdate: () => void;
}

export function PlanEditor({ plan, onClose, onUpdate }: PlanEditorProps) {
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price.toString());
  const [postLimit, setPostLimit] = useState(plan.postLimit.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name,
          price: parseFloat(price),
          post_limit: parseInt(postLimit, 10)
        })
        .eq('id', plan.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit Plan</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Post Limit</label>
            <input
              type="number"
              value={postLimit}
              onChange={(e) => setPostLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}