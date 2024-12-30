import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CheckCircle, XCircle, AlertCircle, Settings, Edit } from 'lucide-react';
import type { AdminIntegration } from './types';

interface AdminIntegrationCardProps {
  integration: AdminIntegration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onEdit: (id: string) => void;
  loading?: boolean;
}

export function AdminIntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect,
  onEdit,
  loading 
}: AdminIntegrationCardProps) {
  const Icon = integration.icon;
  
  const statusIcons = {
    connected: <CheckCircle className="w-5 h-5 text-green-500" />,
    disconnected: <XCircle className="w-5 h-5 text-gray-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">
                {integration.name}
              </h3>
              {statusIcons[integration.status]}
            </div>
            <p className="text-sm text-gray-500">
              {integration.description}
            </p>
            {integration.lastSynced && (
              <p className="text-xs text-gray-400 mt-1">
                Last synced: {new Date(integration.lastSynced).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => onEdit(integration.id)}
            disabled={loading}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={() => integration.status === 'connected' 
              ? onDisconnect(integration.id)
              : onConnect(integration.id)
            }
            variant={integration.status === 'connected' ? 'secondary' : 'primary'}
            loading={loading}
            disabled={loading || integration.status === 'error'}
          >
            {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>
    </Card>
  );
}