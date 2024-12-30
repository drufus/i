import React, { useState } from 'react';
import { Article } from '../../types';
import { usePostStore } from '../../store/postStore';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { PostForm } from './PostForm';
import { validatePostContent, validateScheduleDate } from '../../utils/validation';
import { createPost } from '../../utils/api';

interface PostCreatorProps {
  article: Article;
  onClose: () => void;
}

export function PostCreator({ article, onClose }: PostCreatorProps) {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'linkedin' | 'twitter'>('facebook');
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const contentError = validatePostContent(content, platform);
    const scheduleError = validateScheduleDate(scheduledFor);
    
    if (contentError || scheduleError) {
      setToast({
        message: contentError || scheduleError || 'Validation error',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await createPost({
        article_id: article.id,
        platform,
        content,
        scheduled_for: scheduledFor,
      });
      
      setToast({
        message: 'Post scheduled successfully',
        type: 'success'
      });
      onClose();
    } catch (error) {
      setToast({
        message: 'Failed to schedule post',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold">Create Post</h2>
      </CardHeader>
      <CardContent>
        <PostForm
          platform={platform}
          content={content}
          scheduledFor={scheduledFor}
          loading={loading}
          onPlatformChange={setPlatform}
          onContentChange={setContent}
          onScheduleChange={setScheduledFor}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </CardContent>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  );
}