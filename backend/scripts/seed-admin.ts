import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'password123';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Admin with email ${email} already exists.`);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin
  await prisma.admin.create({
    data: {
      email,
      name: 'Admin User',
      passwordHash,
    },
  });

  console.log(`Created admin account successfully.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
