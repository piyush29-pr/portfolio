import { z } from 'zod';
import { SkillCategory } from '@prisma/client';

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.nativeEnum(SkillCategory),
  proficiency: z.number().int().min(1).max(5).optional().default(3),
  iconUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const updateSkillSchema = createSkillSchema.partial();
