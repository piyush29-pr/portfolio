import { Router } from 'express';
import { resumeController } from './resume.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Public Routes
router.get('/', asyncHandler(resumeController.getResume));
router.post('/download', asyncHandler(resumeController.downloadResume));

export { router as resumePublicRoutes };
