import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Checking if test user already exists...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@shabra.com' },
    });

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      console.log('📝 User details:', {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        roles: existingUser.roles,
      });
      return;
    }

    console.log('🔐 Creating test user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin-password-123', 12);

    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@shabra.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('📝 User details:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    });
    console.log('🔑 Login credentials:');
    console.log('   Email: admin@shabra.com');
    console.log('   Password: admin-password-123');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
