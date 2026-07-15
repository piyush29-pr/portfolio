import { analyticsRepository } from './analytics.repository';

export class AnalyticsService {
  async getDashboardMetrics() {
    // Calculate date for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalVisitors,
      recentVisitorsCount,
      totalResumeDownloads,
      recentResumeDownloadsCount,
      unreadMessagesCount,
      recentVisitors,
      recentDownloads
    ] = await Promise.all([
      analyticsRepository.getVisitorCount(),
      analyticsRepository.getVisitorCount(thirtyDaysAgo),
      analyticsRepository.getResumeDownloadCount(),
      analyticsRepository.getResumeDownloadCount(thirtyDaysAgo),
      analyticsRepository.getMessageCount(true),
      analyticsRepository.getRecentVisitors(5),
      analyticsRepository.getRecentResumeDownloads(5)
    ]);

    return {
      metrics: {
        totalVisitors,
        visitorsLast30Days: recentVisitorsCount,
        totalResumeDownloads,
        resumeDownloadsLast30Days: recentResumeDownloadsCount,
        unreadMessages: unreadMessagesCount,
      },
      recentActivity: {
        visitors: recentVisitors,
        resumeDownloads: recentDownloads,
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
