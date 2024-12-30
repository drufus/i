import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminIntegrations } from '../../components/admin/integrations/data';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function IntegrationSetup() {
  const { integrationId } = useParams();
  const navigate = useNavigate();
  const integration = adminIntegrations.find(i => i.id === integrationId);

  if (!integration) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-700">Integration not found</p>
      </div>
    );
  }

  const Icon = integration.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="secondary"
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Integrations
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Icon className="w-8 h-8 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Connect {integration.name}
            </h1>
            <p className="text-gray-500">{integration.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Add integration-specific setup forms and configuration options here */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Configuration options for {integration.name} will be displayed here.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => navigate('/admin')}>
              Complete Setup
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}