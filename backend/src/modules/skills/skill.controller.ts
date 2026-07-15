import { Request, Response } from 'express';
import { skillService } from './skill.service';
import { createSkillSchema, updateSkillSchema } from './skill.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class SkillController {
  async getAllSkills(req: Request, res: Response) {
    if (req.query.grouped === 'true') {
      const skills = await skillService.getSkillsGroupedByCategory();
      sendSuccess(res, skills);
    } else {
      const skills = await skillService.getAllSkills();
      sendSuccess(res, skills);
    }
  }

  async createSkill(req: Request, res: Response) {
    const parsed = createSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const skill = await skillService.createSkill(parsed.data);
    sendSuccess(res, skill, 201);
  }

  async updateSkill(req: Request, res: Response) {
    const parsed = updateSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }
    const skill = await skillService.updateSkill(req.params.id, parsed.data);
    sendSuccess(res, skill);
  }

  async deleteSkill(req: Request, res: Response) {
    const skill = await skillService.deleteSkill(req.params.id);
    sendSuccess(res, { message: 'Skill deleted', skill });
  }
}

export const skillController = new SkillController();
