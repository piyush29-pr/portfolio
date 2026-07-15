import prisma from '../../lib/prisma';
import { Prisma, Message } from '@prisma/client';

export class MessageRepository {
  async findAll(where?: Prisma.MessageWhereInput): Promise<Message[]> {
    return prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({ where: { id } });
  }

  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  }

  async update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Message> {
    return prisma.message.delete({
      where: { id },
    });
  }
}

export const messageRepository = new MessageRepository();
