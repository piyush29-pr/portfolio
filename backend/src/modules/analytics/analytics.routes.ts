import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const adminRouter = Router();

// Admin Routes (Protected by authMiddleware in app.ts)
adminRouter.get('/dashboard', asyncHandler(analyticsController.getDashboard));

export { adminRouter as analyticsAdminRoutes };
