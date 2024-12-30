import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArticleList } from '../components/articles/ArticleList';
import { ArticleFilters } from '../components/articles/ArticleFilters';
import { useArticleHistory } from '../hooks/useArticleHistory';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { NicheSelector } from '../components/niches/NicheSelector';

export default function History() {
  const user = useAuthStore((state) => state.user);
  const {
    page,
    filters,
    loading,
    error,
    setPage,
    applyFilters,
    fetchHistory
  } = useArticleHistory({
    nicheId: user?.niche ?? null
  });

  useEffect(() => {
    if (user?.niche) {
      fetchHistory();
    }
  }, [fetchHistory, page, filters, user?.niche]);

  if (!user?.niche) {
    return <NicheSelector />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="pb-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Article History
          </h3>
        </div>

        <ArticleFilters
          filters={filters}
          onChange={applyFilters}
        />

        <ArticleList
          articles={[]} // Will be populated from useArticleHistory
          loading={loading}
          error={error}
          hasMore={true}
          onLoadMore={() => setPage(p => p + 1)}
        />
      </div>
    </ErrorBoundary>
  );
}