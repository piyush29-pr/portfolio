import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import cookieParser from 'cookie-parser';
import path from 'path';
import { projectPublicRoutes, projectAdminRoutes } from './modules/projects/project.routes';
import { certificatePublicRoutes, certificateAdminRoutes } from './modules/certificates/certificate.routes';
import { skillPublicRoutes, skillAdminRoutes } from './modules/skills/skill.routes';
import { messagePublicRoutes, messageAdminRoutes } from './modules/messages/message.routes';
import { resumePublicRoutes } from './modules/resume/resume.routes';
import { resumeAdminRoutes } from './modules/resume/resume.admin.routes';
import { visitorPublicRoutes } from './modules/visitors/visitor.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { analyticsAdminRoutes } from './modules/analytics/analytics.routes';
import { mediaAdminRoutes } from './modules/media/media.routes';
import { authMiddleware } from './middleware/auth.middleware';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app: Application = express();

// Global CORS should apply to everything, including static files
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

// Serve uploaded resume files as static early so they don't get strict API headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  xFrameOptions: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Public Routes
app.use('/api/projects', projectPublicRoutes);
app.use('/api/certificates', certificatePublicRoutes);
app.use('/api/skills', skillPublicRoutes);
app.use('/api/contact', messagePublicRoutes);
app.use('/api/resume', resumePublicRoutes);
app.use('/api/visitor', visitorPublicRoutes);

// Admin Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/projects', authMiddleware, projectAdminRoutes);
app.use('/api/admin/certificates', authMiddleware, certificateAdminRoutes);
app.use('/api/admin/skills', authMiddleware, skillAdminRoutes);
app.use('/api/admin/messages', authMiddleware, messageAdminRoutes);
app.use('/api/admin/analytics', authMiddleware, analyticsAdminRoutes);
app.use('/api/admin/resume', authMiddleware, resumeAdminRoutes);
app.use('/api/admin/media', authMiddleware, mediaAdminRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.statusCode || err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export { app, logger };
