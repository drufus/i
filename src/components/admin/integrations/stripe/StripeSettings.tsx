import React, { useState, useEffect } from 'react';
import { useSubscriptionPlans } from '../../../../hooks/useSubscription';
import { useStripeSync } from '../../../../lib/payments/stripe/hooks';
import { SubscriptionPlanForm } from './SubscriptionPlanForm';
import { SubscriptionPlanList } from './SubscriptionPlanList';
import { Button } from '../../../ui/Button';
import { Toast } from '../../../ui/Toast';
import { Plus, RefreshCw } from 'lucide-react';
import type { SubscriptionPlan } from '../../../../types/subscription';
import { supabase } from '../../../../lib/supabase';

export function StripeSettings() {
  const { plans, loading, error: plansError, createPlan, updatePlan, deletePlan } = useSubscriptionPlans();
  const { syncPlans, syncing, error: syncError } = useStripeSync();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkStripeConnection();
  }, []);

  const checkStripeConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('value')
        .eq('name', 'stripe_public_key')
        .eq('environment', 'production')
        .single();

      setIsConnected(!!data?.value);
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      try {
        const { error } = await supabase.rpc('clear_stripe_keys');
        if (error) throw error;
        
        setIsConnected(false);
        setToast({
          message: 'Stripe disconnected successfully',
          type: 'success'
        });
        
        await checkStripeConnection();
      } catch (error) {
        setToast({
          message: 'Failed to disconnect Stripe',
          type: 'error'
        });
      }
    } else {
      window.location.href = '/admin/integrations/stripe/setup';
    }
  };

  const handleSync = async () => {
    try {
      await syncPlans();
      setToast({
        message: 'Plans synced with Stripe successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to sync with Stripe',
        type: 'error' 
      });
    }
  };

  const handleSubmit = async (data: Partial<SubscriptionPlan>) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, data);
        setToast({ message: 'Plan updated successfully', type: 'success' });
      } else {
        await createPlan(data);
        setToast({ message: 'Plan created successfully', type: 'success' });
      }
      setShowForm(false);
      setEditingPlan(null);
      
      await handleSync();
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to save plan',
        type: 'error' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Stripe Integration</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleConnect}
          >
            {isConnected ? 'Disconnect Stripe' : 'Connect Stripe'}
          </Button>
          {isConnected && (
            <>
              <Button
                variant="secondary"
                onClick={handleSync}
                loading={syncing}
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync with Stripe
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {(plansError || syncError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            {plansError?.message || syncError?.message || 'An error occurred'}
          </p>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {showForm && (
            <SubscriptionPlanForm
              plan={editingPlan}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPlan(null);
              }}
            />
          )}
          
          {isConnected && (
            <SubscriptionPlanList
              plans={plans}
              onEdit={(plan) => {
                setEditingPlan(plan);
                setShowForm(true);
              }}
              onDelete={deletePlan}
            />
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}