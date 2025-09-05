import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run: npx prisma db seed');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) in database:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Roles: ${user.roles.join(', ')}`);
      console.log(`   ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('🔐 Default login credentials:');
    console.log('   Admin: admin@shabra.com / admin-password-123');
    console.log('   User:  user@shabra.com / user-password-123');
    console.log('');

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
