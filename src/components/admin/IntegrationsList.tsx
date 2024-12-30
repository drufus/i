import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
}

export function IntegrationsList() {
  const integrations: Integration[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook Business account to manage posts',
      icon: Facebook,
      connected: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram Professional account',
      icon: Instagram,
      connected: false
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Connect your Twitter account to manage tweets',
      icon: Twitter,
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn profile or company page',
      icon: Linkedin,
      connected: false
    }
  ];

  const handleConnect = (integrationId: string) => {
    console.log('Connecting to:', integrationId);
    // Integration connection logic will be implemented here
  };

return (
  <div className="space-y-4">
    {integrations.map((integration) => (
      <Card key={integration.id} className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <integration.icon className="w-6 h-6 text-gray-700" />
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
            onClick={() => handleConnect(integration.id)}
            variant={integration.connected ? 'secondary' : 'primary'}
          >
            {integration.connected ? 'Connected' : 'Connect'}
          </Button>
        </div>
      </Card>
    ))}
  </div>
);

}