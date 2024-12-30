import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';
import type { Niche } from '../../types';

interface NicheCardProps {
  niche: Niche;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (nicheId: string) => void;
}

export function NicheCard({ niche, isSelected, disabled, onSelect }: NicheCardProps) {
  return (
    <button
      onClick={() => !disabled && !isSelected && onSelect(niche.id)}
      disabled={disabled || isSelected}
      className={`group relative w-full rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected 
          ? 'ring-4 ring-indigo-600 shadow-xl cursor-default' 
          : disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:ring-2 hover:ring-indigo-400 hover:shadow-lg'
      }`}
    >
      <div className="aspect-square relative">
        <img
          src={niche.image_url}
          alt={niche.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
        />
        <div className={`absolute inset-0 transition-opacity duration-200 ${
          isSelected 
            ? 'bg-gradient-to-t from-indigo-900/80 to-indigo-900/40' 
            : 'bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100'
        }`} />
        {isSelected ? (
          <div className="absolute top-4 right-4">
            <div className="bg-white rounded-full p-1">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        ) : disabled && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 rounded-full p-1">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
        <h3 className="font-semibold text-xl text-white capitalize mb-2">
          {niche.name.replace(/_/g, ' ')}
        </h3>
        <p className={`text-sm transition-opacity duration-200 ${
          isSelected ? 'text-indigo-100' : 'text-gray-100 opacity-0 group-hover:opacity-100'
        }`}>
          {niche.description}
        </p>
      </div>
    </button>
  );
}