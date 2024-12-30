import React from 'react';
import { User } from '../../types';
import { useNiches } from '../../hooks/useNiches';

interface AdminUserCardProps {
  user: User;
  onNicheUpdate: (userId: string, nicheId: string) => Promise<void>;
}

export function AdminUserCard({ user, onNicheUpdate }: AdminUserCardProps) {
  const { niches } = useNiches(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.email}</h3>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
          <p className="text-sm text-gray-500 capitalize">
            Subscription: {user.subscription_tier}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={user.niche || ''}
            onChange={(e) => onNicheUpdate(user.id, e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select niche</option>
            {niches.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}