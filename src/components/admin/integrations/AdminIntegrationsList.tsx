import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminIntegrations } from './data';
import { AdminIntegrationCard } from './AdminIntegrationCard';
import { Toast } from '../../ui/Toast';

export function AdminIntegrationsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleConnect = async (integrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      navigate(`/admin/integrations/${integrationId}/setup`);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Handle disconnection logic here
      navigate(`/admin/integrations/${integrationId}/manage`);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  const handleEdit = async (integrationId: string) => {
    navigate(`/admin/integrations/${integrationId}/manage`);
  };

  return (
    <div className="space-y-4">
      {adminIntegrations.map((integration) => (
        <AdminIntegrationCard
          key={integration.id}
          integration={integration}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onEdit={handleEdit}
          loading={loading}
        />
      ))}
      
      {error && (
        <Toast
          message={error.message}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}