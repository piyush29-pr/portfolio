import { Request, Response } from 'express';
import { resumeService } from './resume.service';
import { resumeDownloadSchema } from './resume.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class ResumeController {
  async getResume(req: Request, res: Response) {
    const resumes = await resumeService.getResumes();
    sendSuccess(res, resumes);
  }

  async downloadResume(req: Request, res: Response) {
    const parsed = resumeDownloadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await resumeService.logDownload(parsed.data, ipAddress);
    sendSuccess(res, result);
  }
}

export const resumeController = new ResumeController();
