import React from 'react';
import { useSubscriptionPlans } from '../../hooks/useSubscription';
import { Card } from '../ui/Card';

export function SubscriptionManager() {
  const { plans, loading, error } = useSubscriptionPlans();

  if (loading) {
    return <div>Loading subscription plans...</div>;
  }

  if (error) {
    return <div>Error loading plans: {error.message}</div>;
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${plan.price}/{plan.interval}
                  </p>
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md">
                    Disable
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm">Post limit: {plan.postLimit}</p>
                <p className="text-sm">Niche limit: {plan.nicheLimit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}