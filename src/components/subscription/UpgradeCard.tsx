import React from 'react';
import { useStripeCheckout } from '../../lib/payments/stripe/hooks';
import type { SubscriptionPlan } from '../../types/subscription';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';

interface UpgradeCardProps {
  plan: SubscriptionPlan;
  currentTier: string;
}

export function UpgradeCard({ plan, currentTier }: UpgradeCardProps) {
  const { checkout, loading, error } = useStripeCheckout();
  
  const canUpgrade = 
    (currentTier === 'basic' && (plan.tier === 'pro' || plan.tier === 'premium')) ||
    (currentTier === 'pro' && plan.tier === 'premium');

  const handleUpgrade = async () => {
    try {
      await checkout({
        priceId: plan.stripe_price_id,
        successUrl: `${window.location.origin}/settings?success=true`,
        cancelUrl: `${window.location.origin}/settings?canceled=true`
      });
    } catch (error) {
      console.error('Error upgrading:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-2xl font-bold mt-2">
        ${plan.price}
        <span className="text-sm text-gray-500">/{plan.interval}</span>
      </p>
      <ul className="mt-4 space-y-2">
        {plan.features?.map((feature) => (
          <li key={feature.id} className="flex items-center text-sm">
            {feature.included ? '✓' : '×'} {feature.name}
          </li>
        ))}
      </ul>
      <Button
        onClick={handleUpgrade}
        disabled={!canUpgrade || loading}
        loading={loading}
        className="w-full mt-6"
      >
        {canUpgrade ? 'Upgrade Now' : 'Current Plan'}
      </Button>

      {error && (
        <Toast
          message={error.message}
          type="error"
          onClose={() => {}}
        />
      )}
    </div>
  );
}