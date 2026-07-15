import prisma from '../../lib/prisma';
import { Prisma, Certificate } from '@prisma/client';

export class CertificateRepository {
  async findAll(): Promise<Certificate[]> {
    return prisma.certificate.findMany({
      orderBy: { issueDate: 'desc' },
    });
  }

  async findById(id: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({ where: { id } });
  }

  async create(data: Prisma.CertificateCreateInput): Promise<Certificate> {
    return prisma.certificate.create({ data });
  }

  async update(id: string, data: Prisma.CertificateUpdateInput): Promise<Certificate> {
    return prisma.certificate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Certificate> {
    return prisma.certificate.delete({
      where: { id },
    });
  }
}

export const certificateRepository = new CertificateRepository();
