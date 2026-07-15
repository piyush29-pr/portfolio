import { z } from 'zod';

export const logVisitorSchema = z.object({
  page: z.string().min(1, 'Page is required'),
  country: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
  browser: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
});
