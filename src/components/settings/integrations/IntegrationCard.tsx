import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { Integration } from './types';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  loading?: boolean;
}

export function IntegrationCard({ integration, onConnect, loading }: IntegrationCardProps) {
  const Icon = integration.icon;
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {integration.name}
            </h3>
            <p className="text-sm text-gray-500">
              {integration.description}
            </p>
          </div>
        </div>
        <Button
          onClick={() => onConnect(integration.id)}
          variant={integration.connected ? 'secondary' : 'primary'}
          loading={loading}
          disabled={loading || integration.connected}
        >
          {integration.connected ? 'Connected' : 'Connect'}
        </Button>
      </div>
    </Card>
  );
}