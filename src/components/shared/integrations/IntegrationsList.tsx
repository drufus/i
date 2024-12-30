import React from 'react';
import { integrations } from './data';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrations } from '../../../hooks/useIntegrations';
import { Toast } from '../../ui/Toast';

export function IntegrationsList() {
  const { connect, loading, error, clearError } = useIntegrations();

  const handleConnect = async (integrationId: string) => {
    try {
      await connect(integrationId);
    } catch (error) {
      console.error('Error connecting integration:', error);
    }
  };

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onConnect={handleConnect}
          loading={loading}
        />
      ))}
      
      {error && (
        <Toast
          message={error.message}
          type="error"
          onClose={clearError}
        />
      )}
    </div>
  );
}