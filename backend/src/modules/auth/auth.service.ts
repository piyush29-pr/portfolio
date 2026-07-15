import { authRepository } from './auth.repository';
import { AppError } from '../../errors/AppError';
import { z } from 'zod';
import { loginSchema } from './auth.validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  async login(data: z.infer<typeof loginSchema>): Promise<{ token: string; admin: any }> {
    const admin = await authRepository.findAdminByEmail(data.email);
    if (!admin) {
      throw AppError.Unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, admin.passwordHash);
    if (!isMatch) {
      throw AppError.Unauthorized('Invalid email or password');
    }

    // Update last login async
    authRepository.updateLastLogin(admin.id).catch(console.error);

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    const { passwordHash, ...adminWithoutPassword } = admin;

    return { token, admin: adminWithoutPassword };
  }
  
  async getAdminById(id: string): Promise<any> {
    const admin = await authRepository.findAdminById(id);
    if (!admin) {
      throw AppError.NotFound('Admin not found');
    }
    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }
}

export const authService = new AuthService();
