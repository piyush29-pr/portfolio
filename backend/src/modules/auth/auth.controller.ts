import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.validator';
import { sendSuccess } from '../../lib/apiResponse';
import { AppError } from '../../errors/AppError';

const isProduction = process.env.NODE_ENV === 'production';

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.BadRequest('Validation Error', parsed.error.format());
    }

    const { token, admin } = await authService.login(parsed.data);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    sendSuccess(res, { message: 'Logged in successfully', admin, token });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
    });
    sendSuccess(res, { message: 'Logged out successfully' });
  }

  async getMe(req: Request, res: Response) {
    // req.adminId is set by authMiddleware
    if (!req.adminId) {
      throw AppError.Unauthorized();
    }
    const admin = await authService.getAdminById(req.adminId);
    sendSuccess(res, admin);
  }
}

export const authController = new AuthController();
