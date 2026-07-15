import { resumeRepository } from './resume.repository';
import { z } from 'zod';
import { resumeDownloadSchema } from './resume.validator';

export class ResumeService {
  async getResumes(): Promise<{ pdfUrl: string | null; videoUrl: string | null }> {
    const latestPdf = await resumeRepository.getLatestResumeFile('PDF');
    const latestVideo = await resumeRepository.getLatestResumeFile('VIDEO');

    return {
      pdfUrl: latestPdf ? `/uploads/resume/${latestPdf.filename}` : null,
      videoUrl: latestVideo ? `/uploads/resume/${latestVideo.filename}` : null,
    };
  }

  async logDownload(data: z.infer<typeof resumeDownloadSchema>, ipAddress?: string): Promise<{ url: string | null }> {
    await resumeRepository.logDownload({
      ...data,
      ipAddress,
    });
    const resumes = await this.getResumes();
    return { url: resumes.pdfUrl };
  }
}

export const resumeService = new ResumeService();
