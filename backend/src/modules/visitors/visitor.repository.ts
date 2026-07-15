import prisma from '../../lib/prisma';
import { Prisma, Visitor } from '@prisma/client';

export class VisitorRepository {
  async create(data: Prisma.VisitorCreateInput): Promise<Visitor> {
    return prisma.visitor.create({ data });
  }

  async getRecentVisitors(limit: number = 100): Promise<Visitor[]> {
    return prisma.visitor.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}

export const visitorRepository = new VisitorRepository();
