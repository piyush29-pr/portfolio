import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  githubUrl: z.string().url().optional().nullable(),
  liveUrl: z.string().url().optional().nullable(),
  caseStudyUrl: z.string().url().optional().nullable(),
  featured: z.boolean().optional().default(false),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.DRAFT),
  sortOrder: z.number().int().optional().default(0),
});

export const updateProjectSchema = createProjectSchema.partial();
