import { CreditCard, Mail, Webhook, Box } from 'lucide-react';
import type { AdminIntegration } from './types';

export const adminIntegrations: AdminIntegration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    icon: CreditCard,
    status: 'connected',
    lastSynced: new Date().toISOString()
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email notifications and marketing communications',
    icon: Mail,
    status: 'disconnected'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with third-party services',
    icon: Webhook,
    status: 'disconnected'
  },
  {
    id: 'aws',
    name: 'AWS S3',
    description: 'Media storage and content delivery',
    icon: Box,
    status: 'connected',
    lastSynced: new Date().toISOString()
  }
];