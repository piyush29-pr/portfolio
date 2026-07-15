import path from 'path';
import fs from 'fs';
import { resumeAdminRepository } from './resume.admin.repository';
import { ResumeFile } from '@prisma/client';
import { AppError } from '../../errors/AppError';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'resume');

interface CreateResumeFileInput {
  type: 'PDF' | 'VIDEO';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export class ResumeAdminService {
  async saveResumeFile(data: CreateResumeFileInput): Promise<ResumeFile> {
    return resumeAdminRepository.create(data);
  }

  async listResumeFiles(): Promise<ResumeFile[]> {
    return resumeAdminRepository.findAll();
  }

  async deleteResumeFile(id: string): Promise<void> {
    const file = await resumeAdminRepository.findById(id);
    if (!file) {
      throw AppError.NotFound('Resume file not found');
    }

    // Delete the actual file from disk
    const filePath = path.join(UPLOADS_DIR, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resumeAdminRepository.deleteById(id);
  }
}

export const resumeAdminService = new ResumeAdminService();
