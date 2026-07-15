import { Request, Response } from 'express';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class MediaController {
  async uploadImage(req: Request, res: Response) {
    if (!req.file) {
      throw AppError.BadRequest('No file uploaded');
    }

    // Construct the URL path that the frontend will use to access the image
    // The static middleware serves the entire 'uploads' folder at '/uploads'
    const fileUrl = `/uploads/images/${req.file.filename}`;

    sendSuccess(res, {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    }, 201);
  }
}

export const mediaController = new MediaController();
