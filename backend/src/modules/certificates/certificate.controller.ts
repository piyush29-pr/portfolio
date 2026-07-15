import { Request, Response } from 'express';
import { certificateService } from './certificate.service';
import { createCertificateSchema, updateCertificateSchema } from './certificate.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class CertificateController {
  async getAllCertificates(req: Request, res: Response) {
    const certificates = await certificateService.getAllCertificates();
    sendSuccess(res, certificates);
  }

  async createCertificate(req: Request, res: Response) {
    const parsed = createCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const certificate = await certificateService.createCertificate(parsed.data);
    sendSuccess(res, certificate, 201);
  }

  async updateCertificate(req: Request, res: Response) {
    const parsed = updateCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const certificate = await certificateService.updateCertificate(req.params.id, parsed.data);
    sendSuccess(res, certificate);
  }

  async deleteCertificate(req: Request, res: Response) {
    const certificate = await certificateService.deleteCertificate(req.params.id);
    sendSuccess(res, { message: 'Certificate deleted', certificate });
  }
}

export const certificateController = new CertificateController();
