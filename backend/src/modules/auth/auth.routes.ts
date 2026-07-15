import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// These routes will be mounted under /api/admin/auth
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authMiddleware, asyncHandler(authController.getMe));

export { router as authRoutes };
