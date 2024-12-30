import { LucideIcon } from 'lucide-react';

export interface AdminIntegration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'error';
  lastSynced?: string;
}