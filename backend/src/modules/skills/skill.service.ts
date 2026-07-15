import { skillRepository } from './skill.repository';
import { AppError } from '../../errors/AppError';
import { Skill } from '@prisma/client';
import { z } from 'zod';
import { createSkillSchema, updateSkillSchema } from './skill.validator';

export class SkillService {
  async getAllSkills(): Promise<Skill[]> {
    return skillRepository.findAll();
  }
  
  async getSkillsGroupedByCategory(): Promise<Record<string, Skill[]>> {
    const skills = await skillRepository.findAll();
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  }

  async getSkillById(id: string): Promise<Skill> {
    const skill = await skillRepository.findById(id);
    if (!skill) {
      throw AppError.NotFound(`Skill with id '${id}' not found`);
    }
    return skill;
  }

  async createSkill(data: z.infer<typeof createSkillSchema>): Promise<Skill> {
    const existing = await skillRepository.findByName(data.name);
    if (existing) {
      throw AppError.BadRequest(`Skill with name '${data.name}' already exists`);
    }
    return skillRepository.create(data);
  }

  async updateSkill(id: string, data: z.infer<typeof updateSkillSchema>): Promise<Skill> {
    const skill = await skillRepository.findById(id);
    if (!skill) {
      throw AppError.NotFound(`Skill with id '${id}' not found`);
    }
    
    if (data.name && data.name !== skill.name) {
      const existing = await skillRepository.findByName(data.name);
      if (existing) {
        throw AppError.BadRequest(`Skill with name '${data.name}' already exists`);
      }
    }
    
    return skillRepository.update(id, data);
  }

  async deleteSkill(id: string): Promise<Skill> {
    const skill = await skillRepository.findById(id);
    if (!skill) {
      throw AppError.NotFound(`Skill with id '${id}' not found`);
    }
    return skillRepository.delete(id);
  }
}

export const skillService = new SkillService();
