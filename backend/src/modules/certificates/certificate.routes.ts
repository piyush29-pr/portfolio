import { Router } from 'express';
import { certificateController } from './certificate.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const adminRouter = Router();

// Public Routes
router.get('/', asyncHandler(certificateController.getAllCertificates));

// Admin Routes (Auth middleware later)
adminRouter.get('/', asyncHandler(certificateController.getAllCertificates));
adminRouter.post('/', asyncHandler(certificateController.createCertificate));
adminRouter.put('/:id', asyncHandler(certificateController.updateCertificate));
adminRouter.delete('/:id', asyncHandler(certificateController.deleteCertificate));

export { router as certificatePublicRoutes, adminRouter as certificateAdminRoutes };
