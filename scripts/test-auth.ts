import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuthentication() {
  try {
    console.log('🔐 Testing authentication...\n');

    const testCredentials = [
      { email: 'admin@shabra.com', password: 'admin-password-123' },
      { email: 'user@shabra.com', password: 'user-password-123' },
    ];

    for (const cred of testCredentials) {
      console.log(`Testing: ${cred.email}`);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: cred.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
          roles: true,
          isActive: true,
        },
      });

      if (!user) {
        console.log(`❌ User not found: ${cred.email}`);
        continue;
      }

      console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Roles: ${user.roles.join(', ')}`);

      // Test password
      const isPasswordValid = await bcrypt.compare(cred.password, user.password);
      console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`);

      if (isPasswordValid && user.isActive) {
        console.log(`✅ Authentication would succeed for ${cred.email}\n`);
      } else {
        console.log(`❌ Authentication would fail for ${cred.email}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthentication();
