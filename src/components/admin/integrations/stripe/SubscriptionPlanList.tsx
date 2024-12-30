import React from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import type { SubscriptionPlan } from '../../../../types/subscription';

interface SubscriptionPlanListProps {
  plans: SubscriptionPlan[];
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => Promise<void>;
}

export function SubscriptionPlanList({ plans, onEdit, onDelete }: SubscriptionPlanListProps) {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full capitalize bg-indigo-100 text-indigo-700">
                  {plan.tier}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ${plan.price}/{plan.interval}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <p>Post Limit: {plan.postLimit}</p>
                <p>Niche Limit: {plan.nicheLimit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => onEdit(plan)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDelete(plan.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}