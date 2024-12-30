import React from 'react';
import { Article } from '../../types';
import { ArticleGrid } from './ArticleGrid';
import { ArticleSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onCreatePost?: (article: Article) => void;
}

export function ArticleList({
  articles,
  loading,
  error,
  hasMore,
  onLoadMore,
  onCreatePost
}: ArticleListProps) {
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-700">Failed to load articles: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ArticleGrid articles={articles} onCreatePost={onCreatePost} />
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} variant="secondary">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}