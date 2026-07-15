import { Request, Response } from 'express';
import { visitorService } from './visitor.service';
import { logVisitorSchema } from './visitor.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class VisitorController {
  async logVisitor(req: Request, res: Response) {
    const parsed = logVisitorSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const ipAddress = req.ip || req.socket.remoteAddress;
    await visitorService.logVisitor(parsed.data, ipAddress);
    
    // Kept deliberately minimal for performance since this fires often
    sendSuccess(res, { logged: true }, 201);
  }
}

export const visitorController = new VisitorController();
