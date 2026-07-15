import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

// Augment express Request to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw AppError.Unauthorized('Authentication token missing');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Attach the admin ID to the request object
    req.adminId = decoded.id;
    
    next();
  } catch (error) {
    next(AppError.Unauthorized('Invalid or expired token'));
  }
};
