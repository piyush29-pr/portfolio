import { z } from 'zod';

export const resumeDownloadSchema = z.object({
  country: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
});
