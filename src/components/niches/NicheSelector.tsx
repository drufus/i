import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNiches } from '../../hooks/useNiches';
import { NicheCard } from './NicheCard';
import { Sparkles, Crown } from 'lucide-react';
import { Toast } from '../ui/Toast';

export function NicheSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    niches, 
    selectedNiches, 
    loading, 
    error,
    errorMessage,
    toggleNiche,
    userTier,
    tierLimit,
    clearError
  } = useNiches(user?.id ?? null);

  const handleNicheSelect = async (nicheId: string) => {
    try {
      await toggleNiche(nicheId);
      // Redirect to dashboard after successful niche selection
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error selecting niche:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Niche
          </h2>
        </div>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Select your content niche to customize your feed.
        </p>
        
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full">
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 capitalize">
            {userTier} Tier ({selectedNiches.length}/{tierLimit} niches)
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {niches.map((niche) => (
            <NicheCard
              key={niche.id}
              niche={niche}
              isSelected={selectedNiches.includes(niche.id)}
              onSelect={handleNicheSelect}
              disabled={selectedNiches.length >= tierLimit && !selectedNiches.includes(niche.id)}
            />
          ))}
        </div>
      )}

      {selectedNiches.length === 0 && !loading && (
        <p className="text-center mt-8 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Please select a niche to continue
        </p>
      )}

      {errorMessage && (
        <Toast
          message={errorMessage}
          type="error"
          onClose={clearError}
        />
      )}
    </div>
  );
}