import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductionDatabase() {
  try {
    console.log('🔍 Checking production database...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Check if users table exists and has data
    console.log('2. Checking users table...');
    const userCount = await prisma.user.count();
    console.log(`   Total users: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found in production database!');
      console.log('💡 This is likely the cause of CredentialsSignin error');
      console.log('   The database needs to be seeded with default users.\n');
      
      console.log('🔧 Solution:');
      console.log('   1. Run: npx prisma db seed');
      console.log('   2. Or manually create users in the database');
      console.log('   3. Or run the seed script in production\n');
      
      return;
    }

    // List all users
    console.log('3. Listing all users:');
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

    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`      📧 Email: ${user.email}`);
      console.log(`      🔑 Roles: ${user.roles.join(', ')}`);
      console.log(`      ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`      📅 Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // Test authentication for each user
    console.log('4. Testing authentication:');
    const testCredentials = [
      { email: 'admin@shabra.com', password: 'admin-password-123' },
      { email: 'user@shabra.com', password: 'user-password-123' },
    ];

    for (const cred of testCredentials) {
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

      if (user) {
        console.log(`   ✅ ${cred.email}: User exists and is active`);
      } else {
        console.log(`   ❌ ${cred.email}: User not found`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking production database:', error);
    console.log('\n🔧 Possible solutions:');
    console.log('   1. Check PRISMA_DATABASE_URL environment variable');
    console.log('   2. Verify database connection string');
    console.log('   3. Check if database is accessible from Vercel');
    console.log('   4. Run database migrations: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionDatabase();
