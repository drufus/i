import { LucideIcon } from 'lucide-react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  connected: boolean;
}