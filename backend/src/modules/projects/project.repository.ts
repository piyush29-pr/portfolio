import prisma from '../../lib/prisma';
import { Prisma, Project } from '@prisma/client';

export class ProjectRepository {
  async findAll(where?: Prisma.ProjectWhereInput): Promise<Project[]> {
    return prisma.project.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { slug } });
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    });
  }
}

export const projectRepository = new ProjectRepository();
