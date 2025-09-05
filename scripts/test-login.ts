import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔐 Testing login process...\n');

    const testCredentials = [
      { email: 'admin@shabra.com', password: 'admin-password-123' },
      { email: 'user@shabra.com', password: 'user-password-123' },
    ];

    for (const cred of testCredentials) {
      console.log(`Testing login for: ${cred.email}`);
      
      // Step 1: Find user
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
      console.log(`   ID: ${user.id}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Roles: ${user.roles.join(', ')}`);

      // Step 2: Check if user is active
      if (!user.isActive) {
        console.log(`❌ User is not active: ${cred.email}`);
        continue;
      }

      // Step 3: Test password
      const isPasswordValid = await bcrypt.compare(cred.password, user.password);
      console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`);

      if (isPasswordValid) {
        console.log(`✅ Login would succeed for ${cred.email}`);
        console.log(`   User data that would be returned:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.firstName} ${user.lastName}`);
        console.log(`   - Roles: ${user.roles.join(', ')}`);
      } else {
        console.log(`❌ Login would fail for ${cred.email} - Invalid password`);
      }

      console.log('');
    }

    console.log('🔑 Summary of login credentials:');
    console.log('   Admin: admin@shabra.com / admin-password-123');
    console.log('   User:  user@shabra.com / user-password-123');
    console.log('');
    console.log('💡 If you still get CredentialsSignin error:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Check server logs');
    console.log('   3. Verify NEXTAUTH_SECRET is set');
    console.log('   4. Verify NEXTAUTH_URL is set correctly');

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
