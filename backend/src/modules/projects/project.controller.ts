import { Request, Response } from 'express';
import { projectService } from './project.service';
import { createProjectSchema, updateProjectSchema } from './project.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

export class ProjectController {
  // Public
  async getPublicProjects(req: Request, res: Response) {
    const featuredOnly = req.query.featured === 'true';
    const projects = await projectService.getPublicProjects(featuredOnly);
    sendSuccess(res, projects);
  }

  async getProjectBySlug(req: Request, res: Response) {
    const project = await projectService.getProjectBySlug(req.params.slug);
    sendSuccess(res, project);
  }

  // Admin
  async getAllProjects(req: Request, res: Response) {
    const projects = await projectService.getAllAdminProjects();
    sendSuccess(res, projects);
  }

  async createProject(req: Request, res: Response) {
    const parsedResult = createProjectSchema.safeParse(req.body);
    if (!parsedResult.success) {
      throw AppError.BadRequest('Validation Error', parsedResult.error.format());
    }

    const project = await projectService.createProject(parsedResult.data);
    sendSuccess(res, project, 201);
  }

  async updateProject(req: Request, res: Response) {
    const parsedResult = updateProjectSchema.safeParse(req.body);
    if (!parsedResult.success) {
      throw AppError.BadRequest('Validation Error', parsedResult.error.format());
    }

    const project = await projectService.updateProject(req.params.id, parsedResult.data);
    sendSuccess(res, project);
  }

  async deleteProject(req: Request, res: Response) {
    const project = await projectService.deleteProject(req.params.id);
    sendSuccess(res, { message: 'Project deleted successfully', project });
  }
}

export const projectController = new ProjectController();
