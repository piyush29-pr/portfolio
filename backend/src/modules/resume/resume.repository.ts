import prisma from '../../lib/prisma';
import { Prisma, ResumeDownload } from '@prisma/client';

export class ResumeRepository {
  async logDownload(data: Prisma.ResumeDownloadCreateInput): Promise<ResumeDownload> {
    return prisma.resumeDownload.create({ data });
  }

  async getDownloads(): Promise<ResumeDownload[]> {
    return prisma.resumeDownload.findMany({
      orderBy: { downloadedAt: 'desc' },
    });
  }

  async getLatestResumeFile(type: 'PDF' | 'VIDEO') {
    return prisma.resumeFile.findFirst({
      where: { type },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}

export const resumeRepository = new ResumeRepository();
