import { Router } from 'express';
import { projectController } from './project.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const adminRouter = Router();

// Public Routes
router.get('/', asyncHandler(projectController.getPublicProjects));
router.get('/:slug', asyncHandler(projectController.getProjectBySlug));

// Admin Routes (Note: Auth middleware will be added here later)
adminRouter.get('/', asyncHandler(projectController.getAllProjects));
adminRouter.post('/', asyncHandler(projectController.createProject));
adminRouter.put('/:id', asyncHandler(projectController.updateProject));
adminRouter.delete('/:id', asyncHandler(projectController.deleteProject));

export { router as projectPublicRoutes, adminRouter as projectAdminRoutes };
