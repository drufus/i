import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import type { Integration } from './types';

export const integrations: Integration[] = [
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