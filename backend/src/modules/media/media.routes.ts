import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../utils/asyncHandler';
import { mediaController } from './media.controller';
import { AppError } from '../../errors/AppError';

const router = Router();

// Ensure uploads/images directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(AppError.BadRequest('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/admin/media/upload
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(mediaController.uploadImage.bind(mediaController))
);

export const mediaAdminRoutes = router;
