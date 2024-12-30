import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError, ValidationError } from '../lib/errors';
import type { Integration } from '../types';

interface UseIntegrationsOptions {
  userId?: string;
  type?: Integration['type'];
  onError?: (error: AppError) => void;
  autoFetch?: boolean;
}

interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  settings?: Record<string, any>;
}

export function useIntegrations(options: UseIntegrationsOptions = {}) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to fetch integrations');
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('integrations')
        .select('*')
        .eq('user_id', options.userId);

      if (options.type) {
        query = query.eq('type', options.type);
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false });

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      if (!data) {
        throw new DatabaseError('No integrations found', 'NO_DATA');
      }

      setIntegrations(data);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to fetch integrations',
            'FETCH_INTEGRATIONS_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.type, options.onError]);

  const createIntegration = useCallback(async (
    type: Integration['type'],
    name: string,
    config: IntegrationConfig
  ) => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to create integration');
    }

    if (!name.trim()) {
      throw new ValidationError('Integration name is required');
    }

    try {
      // Validate integration-specific requirements
      validateIntegrationConfig(type, config);

      const newIntegration: Partial<Integration> = {
        user_id: options.userId,
        type,
        name: name.trim(),
        status: 'pending',
        config: encryptSensitiveData(config),
        created_at: new Date().toISOString()
      };

      const { data, error: queryError } = await supabase
        .from('integrations')
        .insert([newIntegration])
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setIntegrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to create integration',
            'CREATE_INTEGRATION_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.userId, options.onError]);

  const updateIntegration = useCallback(async (
    integrationId: string,
    updates: Partial<Pick<Integration, 'name' | 'status' | 'config'>>
  ) => {
    try {
      if (updates.config) {
        validateIntegrationConfig(
          integrations.find(i => i.id === integrationId)?.type || 'social',
          updates.config
        );
        updates.config = encryptSensitiveData(updates.config);
      }

      const { data, error: queryError } = await supabase
        .from('integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId)
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId ? data : integration
      ));
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to update integration',
            'UPDATE_INTEGRATION_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [integrations, options.onError]);

  const deleteIntegration = useCallback(async (integrationId: string) => {
    try {
      const { error: queryError } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to delete integration',
            'DELETE_INTEGRATION_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  // Initial fetch if autoFetch is enabled and userId is provided
  useEffect(() => {
    if (options.autoFetch !== false && options.userId) {
      fetchIntegrations();
    }
  }, [fetchIntegrations, options.autoFetch, options.userId]);

  return {
    integrations,
    loading,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration
  };
}

function validateIntegrationConfig(type: Integration['type'], config: IntegrationConfig) {
  switch (type) {
    case 'stripe':
      if (!config.apiKey) {
        throw new ValidationError('Stripe API key is required');
      }
      if (!config.webhookUrl) {
        throw new ValidationError('Stripe webhook URL is required');
      }
      break;
    case 'social':
      if (!config.apiKey) {
        throw new ValidationError('Social media API key is required');
      }
      break;
    case 'analytics':
      if (!config.settings?.trackingId) {
        throw new ValidationError('Analytics tracking ID is required');
      }
      break;
  }
}

function encryptSensitiveData(config: IntegrationConfig): IntegrationConfig {
  // In a real application, you would encrypt sensitive data here
  // For now, we'll just return the config as is
  return config;
}