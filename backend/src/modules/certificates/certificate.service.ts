import { certificateRepository } from './certificate.repository';
import { AppError } from '../../errors/AppError';
import { Certificate } from '@prisma/client';
import { z } from 'zod';
import { createCertificateSchema, updateCertificateSchema } from './certificate.validator';

export class CertificateService {
  async getAllCertificates(): Promise<Certificate[]> {
    return certificateRepository.findAll();
  }

  async getCertificateById(id: string): Promise<Certificate> {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) {
      throw AppError.NotFound(`Certificate with id '${id}' not found`);
    }
    return certificate;
  }

  async createCertificate(data: z.infer<typeof createCertificateSchema>): Promise<Certificate> {
    return certificateRepository.create(data);
  }

  async updateCertificate(id: string, data: z.infer<typeof updateCertificateSchema>): Promise<Certificate> {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) {
      throw AppError.NotFound(`Certificate with id '${id}' not found`);
    }
    return certificateRepository.update(id, data);
  }

  async deleteCertificate(id: string): Promise<Certificate> {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) {
      throw AppError.NotFound(`Certificate with id '${id}' not found`);
    }
    return certificateRepository.delete(id);
  }
}

export const certificateService = new CertificateService();
