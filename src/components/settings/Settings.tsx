import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { NicheSelector } from '../niches/NicheSelector';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';
import { IntegrationsList } from '../shared/integrations';
import { Toast } from '../ui/Toast';
import { Card } from '../ui/Card';

// Rest of the file remains the same...