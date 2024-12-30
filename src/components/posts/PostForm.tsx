import React from 'react';
import { Post } from '../../types';
import { Button } from '../ui/Button';

interface PostFormProps {
  platform: Post['platform'];
  content: string;
  scheduledFor: string;
  loading: boolean;
  onPlatformChange: (platform: Post['platform']) => void;
  onContentChange: (content: string) => void;
  onScheduleChange: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function PostForm({
  platform,
  content,
  scheduledFor,
  loading,
  onPlatformChange,
  onContentChange,
  onScheduleChange,
  onSubmit,
  onCancel,
}: PostFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Platform</label>
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value as Post['platform'])}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule For</label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => onScheduleChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Post
        </Button>
      </div>
    </form>
  );
}