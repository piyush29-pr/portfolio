import { z } from 'zod';
import { MessageStatus } from '@prisma/client';

export const createMessageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  // ipAddress will be captured by the controller, not the user
});

export const updateMessageStatusSchema = z.object({
  status: z.nativeEnum(MessageStatus),
});
