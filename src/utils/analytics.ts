import { Post, PostMetrics, PostAnalytics } from '../types';

export function aggregatePostMetrics(posts: (Post & { metrics: PostMetrics[] })[]): PostAnalytics {
  const platformMetrics = posts.reduce((acc, post) => {
    const platform = post.platform;
    if (!acc[platform]) {
      acc[platform] = {
        total: 0,
        engagement: 0,
        clicks: 0,
        impressions: 0,
      };
    }

    acc[platform].total += 1;
    post.metrics.forEach(metric => {
      acc[platform].engagement += metric.likes + metric.comments + metric.shares;
      acc[platform].clicks += metric.clicks;
      acc[platform].impressions += metric.impressions;
    });

    return acc;
  }, {} as Record<string, PostAnalytics['platforms'][string]>);

  return {
    totalPosts: posts.length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    postedPosts: posts.filter(p => p.status === 'posted').length,
    failedPosts: posts.filter(p => p.status === 'failed').length,
    platforms: platformMetrics,
  };
}