import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { resumeAdminController } from './resume.admin.controller';
import { asyncHandler } from '../../utils/asyncHandler';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'resume');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedPdf = ['application/pdf'];
  const allowedVideo = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];
  const allowed = [...allowedPdf, ...allowedVideo];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and video files are allowed (MP4, WebM, MOV, AVI)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
});

const router = Router();

// Admin resume file routes (all protected by authMiddleware in app.ts)
router.get('/', asyncHandler(resumeAdminController.listResumeFiles));
router.post('/upload', upload.single('file'), asyncHandler(resumeAdminController.uploadResume));
router.delete('/:id', asyncHandler(resumeAdminController.deleteResumeFile));

export { router as resumeAdminRoutes };
