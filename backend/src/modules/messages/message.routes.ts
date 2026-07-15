import { Router } from 'express';
import { messageController } from './message.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const publicRouter = Router();
const adminRouter = Router();

// Public Routes
publicRouter.post('/', asyncHandler(messageController.createMessage));

// Admin Routes (Auth middleware later)
adminRouter.get('/', asyncHandler(messageController.getMessages));
adminRouter.patch('/:id/read', (req, res, next) => {
  // Translate the specific PATCH to the generic status update
  req.body = { status: 'READ' };
  asyncHandler(messageController.updateMessageStatus)(req, res, next);
});
adminRouter.delete('/:id', asyncHandler(messageController.deleteMessage));

export { publicRouter as messagePublicRoutes, adminRouter as messageAdminRoutes };
