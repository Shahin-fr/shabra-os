import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Reset database first to ensure compatibility
  console.log('🔄 Resetting database for compatibility...');
  
  // Delete all existing data
  await prisma.story.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storyIdea.deleteMany();
  await prisma.storyType.deleteMany();
  await prisma.contentSlot.deleteMany();
  await prisma.project.deleteMany();
  await prisma.document.deleteMany();
  
  console.log('✅ Database reset completed');

  // Create admin user
  console.log('Creating admin user...');
  const adminHashedPassword = await bcrypt.hash('admin-password-123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@shabra.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminHashedPassword,
      roles: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin user created successfully');

  // Create regular user
  console.log('Creating regular user...');
  const userHashedPassword = await bcrypt.hash('user-password-123', 12);
  await prisma.user.create({
    data: {
      email: 'user@shabra.com',
      firstName: 'Regular',
      lastName: 'User',
      password: userHashedPassword,
      roles: 'EMPLOYEE',
      isActive: true,
    },
  });
  console.log('Regular user created successfully');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
