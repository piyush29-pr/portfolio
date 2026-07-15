import prisma from '../../lib/prisma';
import { Admin } from '@prisma/client';

export class AuthRepository {
  async findAdminByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { email } });
  }
  
  async findAdminById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { id } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
