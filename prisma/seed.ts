import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@shabra.com' },
  });

  if (!existingAdmin) {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin-password-123', 12);

    await prisma.user.create({
      data: {
        email: 'admin@shabra.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        roles: 'ADMIN' as any,
        isActive: true,
      },
    });
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }

  // Check if regular user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@shabra.com' },
  });

  if (!existingUser) {
    console.log('Creating regular user...');
    const hashedPassword = await bcrypt.hash('user-password-123', 12);

    await prisma.user.create({
      data: {
        email: 'user@shabra.com',
        firstName: 'Regular',
        lastName: 'User',
        password: hashedPassword,
        roles: 'EMPLOYEE' as any,
        isActive: true,
      },
    });
    console.log('Regular user created successfully');
  } else {
    console.log('Regular user already exists');
  }

  console.log('Database seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
