import { z } from 'zod';

export const createCertificateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().min(1, 'Image URL is required'),
  sortOrder: z.number().int().optional().default(0),
});

export const updateCertificateSchema = createCertificateSchema.partial();
