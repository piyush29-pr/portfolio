import prisma from '../../lib/prisma';
import { Prisma, Skill } from '@prisma/client';

export class SkillRepository {
  async findAll(): Promise<Skill[]> {
    return prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
  }

  async findById(id: string): Promise<Skill | null> {
    return prisma.skill.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Skill | null> {
    return prisma.skill.findUnique({ where: { name } });
  }

  async create(data: Prisma.SkillCreateInput): Promise<Skill> {
    return prisma.skill.create({ data });
  }

  async update(id: string, data: Prisma.SkillUpdateInput): Promise<Skill> {
    return prisma.skill.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Skill> {
    return prisma.skill.delete({
      where: { id },
    });
  }
}

export const skillRepository = new SkillRepository();
