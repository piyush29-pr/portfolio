import prisma from '../../lib/prisma';
import { ResumeFile } from '@prisma/client';

interface CreateResumeFileInput {
  type: 'PDF' | 'VIDEO';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export class ResumeAdminRepository {
  async create(data: CreateResumeFileInput): Promise<ResumeFile> {
    return prisma.resumeFile.create({ data });
  }

  async findAll(): Promise<ResumeFile[]> {
    return prisma.resumeFile.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ResumeFile | null> {
    return prisma.resumeFile.findUnique({ where: { id } });
  }

  async deleteById(id: string): Promise<ResumeFile> {
    return prisma.resumeFile.delete({ where: { id } });
  }

  async findByType(type: 'PDF' | 'VIDEO'): Promise<ResumeFile[]> {
    return prisma.resumeFile.findMany({
      where: { type },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}

export const resumeAdminRepository = new ResumeAdminRepository();
