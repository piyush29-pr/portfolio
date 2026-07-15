import { messageRepository } from './message.repository';
import { AppError } from '../../errors/AppError';
import { Message, MessageStatus } from '@prisma/client';
import { z } from 'zod';
import { createMessageSchema, updateMessageStatusSchema } from './message.validator';

export class MessageService {
  async getAllMessages(status?: MessageStatus): Promise<Message[]> {
    return messageRepository.findAll(status ? { status } : undefined);
  }

  async createMessage(data: z.infer<typeof createMessageSchema>, ipAddress?: string): Promise<Message> {
    const message = await messageRepository.create({ ...data, ipAddress });
    
    return message;
  }

  async updateMessageStatus(id: string, data: z.infer<typeof updateMessageStatusSchema>): Promise<Message> {
    const message = await messageRepository.findById(id);
    if (!message) {
      throw AppError.NotFound(`Message with id '${id}' not found`);
    }
    return messageRepository.update(id, data);
  }

  async deleteMessage(id: string): Promise<Message> {
    const message = await messageRepository.findById(id);
    if (!message) {
      throw AppError.NotFound(`Message with id '${id}' not found`);
    }
    return messageRepository.delete(id);
  }
}

export const messageService = new MessageService();
