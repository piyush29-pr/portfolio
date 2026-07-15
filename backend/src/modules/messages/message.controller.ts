import { Request, Response } from 'express';
import { messageService } from './message.service';
import { createMessageSchema, updateMessageStatusSchema } from './message.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';
import { MessageStatus } from '@prisma/client';

export class MessageController {
  async getMessages(req: Request, res: Response) {
    const status = req.query.status as MessageStatus | undefined;
    const messages = await messageService.getAllMessages(status);
    sendSuccess(res, messages);
  }

  async createMessage(req: Request, res: Response) {
    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const ipAddress = req.ip || req.socket.remoteAddress;
    const message = await messageService.createMessage(parsed.data, ipAddress);
    sendSuccess(res, { message: 'Message sent successfully', id: message.id }, 201);
  }

  async updateMessageStatus(req: Request, res: Response) {
    const parsed = updateMessageStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const message = await messageService.updateMessageStatus(req.params.id, parsed.data);
    sendSuccess(res, message);
  }

  async deleteMessage(req: Request, res: Response) {
    const message = await messageService.deleteMessage(req.params.id);
    sendSuccess(res, { message: 'Message deleted', data: message });
  }
}

export const messageController = new MessageController();
