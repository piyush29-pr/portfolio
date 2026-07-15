import { visitorRepository } from './visitor.repository';
import { z } from 'zod';
import { logVisitorSchema } from './visitor.validator';

export class VisitorService {
  async logVisitor(data: z.infer<typeof logVisitorSchema>, ipAddress?: string): Promise<void> {
    await visitorRepository.create({
      ...data,
      ipAddress,
    });
  }
}

export const visitorService = new VisitorService();
