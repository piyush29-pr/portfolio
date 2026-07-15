import { Router } from 'express';
import { skillController } from './skill.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const adminRouter = Router();

// Public Routes
router.get('/', asyncHandler(skillController.getAllSkills));

// Admin Routes (Auth middleware later)
adminRouter.get('/', asyncHandler(skillController.getAllSkills));
adminRouter.post('/', asyncHandler(skillController.createSkill));
adminRouter.put('/:id', asyncHandler(skillController.updateSkill));
adminRouter.delete('/:id', asyncHandler(skillController.deleteSkill));

export { router as skillPublicRoutes, adminRouter as skillAdminRoutes };
