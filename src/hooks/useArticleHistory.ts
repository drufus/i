import { useState } from 'react';
import { Article } from '../types';
import { fetchArticles } from '../utils/api';
import { useSupabaseMutation } from './useSupabase';

interface UseArticleHistoryOptions {
  nicheId: string | null;
  initialPage?: number;
}

export function useArticleHistory({ nicheId, initialPage = 1 }: UseArticleHistoryOptions) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
  });

  const {
    mutate: fetchHistory,
    loading,
    error
  } = useSupabaseMutation<Article[]>(
    async () => {
      if (!nicheId) {
        return { data: [], error: null };
      }
      return fetchArticles(nicheId, page);
    }
  );

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return {
    page,
    filters,
    loading,
    error,
    setPage,
    applyFilters,
    fetchHistory,
  };
}