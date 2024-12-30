import React from 'react';
import { PostAnalytics } from '../../types';

interface PlatformBreakdownProps {
  platforms: PostAnalytics['platforms'];
}

export function PlatformBreakdown({ platforms }: PlatformBreakdownProps) {
  return (
    <div className="space-y-4">
      {Object.entries(platforms).map(([platform, metrics]) => (
        <div key={platform} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium capitalize mb-2">{platform}</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Engagement</p>
              <p className="text-xl font-semibold">{metrics.engagement}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Clicks</p>
              <p className="text-xl font-semibold">{metrics.clicks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Impressions</p>
              <p className="text-xl font-semibold">{metrics.impressions}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}