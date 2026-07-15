import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { resumeAdminService } from './resume.admin.service';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class ResumeAdminController {
  async uploadResume(req: Request, res: Response) {
    if (!req.file) {
      throw AppError.BadRequest('No file uploaded');
    }

    const type = req.body.type as 'PDF' | 'VIDEO';
    if (!type || !['PDF', 'VIDEO'].includes(type)) {
      // Remove the uploaded file since type is invalid
      fs.unlink(req.file.path, () => {});
      throw AppError.BadRequest('type must be PDF or VIDEO');
    }

    const result = await resumeAdminService.saveResumeFile({
      type,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    sendSuccess(res, result, 201);
  }

  async listResumeFiles(req: Request, res: Response) {
    const files = await resumeAdminService.listResumeFiles();
    sendSuccess(res, files);
  }

  async deleteResumeFile(req: Request, res: Response) {
    const { id } = req.params;
    await resumeAdminService.deleteResumeFile(id);
    sendSuccess(res, { message: 'File deleted' });
  }
}

export const resumeAdminController = new ResumeAdminController();
