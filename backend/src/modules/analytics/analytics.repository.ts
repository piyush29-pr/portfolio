import prisma from '../../lib/prisma';

export class AnalyticsRepository {
  async getVisitorCount(startDate?: Date): Promise<number> {
    return prisma.visitor.count({
      where: startDate ? { timestamp: { gte: startDate } } : undefined,
    });
  }

  async getResumeDownloadCount(startDate?: Date): Promise<number> {
    return prisma.resumeDownload.count({
      where: startDate ? { downloadedAt: { gte: startDate } } : undefined,
    });
  }

  async getRecentVisitors(limit: number = 10): Promise<any[]> {
    return prisma.visitor.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getRecentResumeDownloads(limit: number = 10): Promise<any[]> {
    return prisma.resumeDownload.findMany({
      orderBy: { downloadedAt: 'desc' },
      take: limit,
    });
  }

  async getMessageCount(unreadOnly: boolean = false): Promise<number> {
    return prisma.message.count({
      where: unreadOnly ? { status: 'UNREAD' } : undefined,
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
