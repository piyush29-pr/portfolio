import { projectRepository } from './project.repository';
import { AppError } from '../../errors/AppError';
import { Project, ProjectStatus } from '@prisma/client';
import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from './project.validator';

// Utility to create URL-friendly slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export class ProjectService {
  async getPublicProjects(featuredOnly: boolean = false): Promise<Project[]> {
    const where = {
      status: ProjectStatus.PUBLISHED,
      ...(featuredOnly && { featured: true }),
    };
    return projectRepository.findAll(where);
  }

  async getAllAdminProjects(): Promise<Project[]> {
    return projectRepository.findAll();
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const project = await projectRepository.findBySlug(slug);
    if (!project) {
      throw AppError.NotFound(`Project with slug '${slug}' not found`);
    }
    return project;
  }

  async createProject(data: z.infer<typeof createProjectSchema>): Promise<Project> {
    let slug = generateSlug(data.title);
    
    // Ensure uniqueness
    let existing = await projectRepository.findBySlug(slug);
    let counter = 1;
    while (existing) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existing = await projectRepository.findBySlug(slug);
      counter++;
    }

    return projectRepository.create({ ...data, slug });
  }

  async updateProject(id: string, data: z.infer<typeof updateProjectSchema>): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw AppError.NotFound(`Project with id '${id}' not found`);
    }

    let slug = project.slug;
    if (data.title && data.title !== project.title) {
      slug = generateSlug(data.title);
      let existing = await projectRepository.findBySlug(slug);
      let counter = 1;
      while (existing && existing.id !== id) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existing = await projectRepository.findBySlug(slug);
        counter++;
      }
    }

    return projectRepository.update(id, { ...data, slug });
  }

  async deleteProject(id: string): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw AppError.NotFound(`Project with id '${id}' not found`);
    }
    return projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
