import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { NicheSelector } from '../components/niches/NicheSelector';
import { ArticleList } from '../components/articles/ArticleList';
import { PostCreator } from '../components/posts/PostCreator';
import { useArticles } from '../hooks/useArticles';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import type { Article } from '../types';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { articles, loading, error, hasMore, loadMore } = useArticles(user?.niche ?? null);

  // Show niche selector if user hasn't selected a niche
  if (!user?.niche) {
    return <NicheSelector />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-8 text-white rounded-b-3xl shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Welcome back!</h1>
            </div>
            <p className="mt-2 text-indigo-100">Your content dashboard is ready</p>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Performance Overview</h2>
          <AnalyticsDashboard />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Curated Articles</h2>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              {articles.length} Articles
            </div>
          </div>
          
          <ArticleList
            articles={articles}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onCreatePost={setSelectedArticle}
          />
        </div>

        {selectedArticle && (
          <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <PostCreator
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}