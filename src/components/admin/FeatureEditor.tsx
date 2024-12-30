import React, { useState } from 'react';
import { SubscriptionFeature } from '../../types/subscription';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface FeatureEditorProps {
  planId: string;
  feature?: SubscriptionFeature;
  onClose: () => void;
  onUpdate: () => void;
}

export function FeatureEditor({ planId, feature, onClose, onUpdate }: FeatureEditorProps) {
  const [name, setName] = useState(feature?.name ?? '');
  const [description, setDescription] = useState(feature?.description ?? '');
  const [included, setIncluded] = useState(feature?.included ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (feature) {
        const { error } = await supabase
          .from('subscription_features')
          .update({ name, description, included })
          .eq('id', feature.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscription_features')
          .insert([{ plan_id: planId, name, description, included }]);
        if (error) throw error;
      }

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
        <h3 className="text-lg font-semibold mb-4">
          {feature ? 'Edit Feature' : 'Add Feature'}
        </h3>
        
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
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={included}
              onChange={(e) => setIncluded(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Included in plan
            </label>
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
              {feature ? 'Save Changes' : 'Add Feature'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}