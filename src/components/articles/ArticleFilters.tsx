import React from 'react';
import { Button } from '../ui/Button';

interface ArticleFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    search: string;
  };
  onChange: (filters: {
    startDate: string;
    endDate: string;
    search: string;
  }) => void;
}

export function ArticleFilters({ filters, onChange }: ArticleFiltersProps) {
  const handleChange = (key: keyof typeof filters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...filters, [key]: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={handleChange('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={handleChange('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={handleChange('search')}
            placeholder="Search articles..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}