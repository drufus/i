import React from 'react';
import { Article } from '../../types';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  onCreatePost?: (article: Article) => void;
}

export function ArticleGrid({ articles, onCreatePost }: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onCreatePost={onCreatePost}
        />
      ))}
    </div>
  );
}