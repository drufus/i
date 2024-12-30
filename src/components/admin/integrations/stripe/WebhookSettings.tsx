import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Toast } from '../../../ui/Toast';
import { RefreshCw } from 'lucide-react';
import { useWebhookDomain } from '../../../../hooks/useWebhookDomain';

export function WebhookSettings() {
  const { domain, loading, error, updateDomain, refreshEndpoints } = useWebhookDomain();
  const [newDomain, setNewDomain] = useState(domain || '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setNewDomain(domain || '');
  }, [domain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDomain(newDomain);
      setToast({ message: 'Webhook domain updated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: (error as Error).message, type: 'error' });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Webhook Domain
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              https://
            </span>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="your-domain.com"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter your domain without https:// prefix
          </p>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={refreshEndpoints}
            loading={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Endpoints
          </Button>
          
          <Button type="submit" loading={loading}>
            Update Domain
          </Button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  );
}