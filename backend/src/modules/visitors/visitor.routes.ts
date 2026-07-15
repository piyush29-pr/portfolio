import { Router } from 'express';
import { visitorController } from './visitor.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Public Routes
router.post('/', asyncHandler(visitorController.logVisitor));

export { router as visitorPublicRoutes };
