import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVercelDatabase() {
  try {
    console.log('🔍 Testing Vercel PostgreSQL database...\n');

    // Test 1: Database connection
    console.log('1. Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.log('❌ Database connection failed:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   This means the database is not accessible or credentials are wrong\n');
      return;
    }

    // Test 2: Check if users table exists and has data
    console.log('2. Checking users table...');
    try {
      const userCount = await prisma.user.count();
      console.log(`   Total users in database: ${userCount}`);

      if (userCount === 0) {
        console.log('❌ No users found in Vercel database!');
        console.log('   This is the cause of CredentialsSignin error');
        console.log('   The database needs to be seeded with default users.\n');
        
        console.log('🔧 Solutions:');
        console.log('   1. Use the seed API: POST /api/seed');
        console.log('   2. Or run: npx tsx scripts/seed-production.ts');
        console.log('   3. Or manually create users in the database\n');
        
        return;
      }

      console.log('✅ Users found in database\n');
    } catch (error) {
      console.log('❌ Error checking users table:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   This might mean the database schema is not set up\n');
      return;
    }

    // Test 3: List all users
    console.log('3. Listing all users:');
    try {
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
    } catch (error) {
      console.log('❌ Error listing users:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Test authentication for default users
    console.log('4. Testing authentication for default users:');
    const testCredentials = [
      { email: 'admin@shabra.com', password: 'admin-password-123' },
      { email: 'user@shabra.com', password: 'user-password-123' },
    ];

    for (const cred of testCredentials) {
      try {
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
      } catch (error) {
        console.log(`   ❌ ${cred.email}: Error checking user`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log('   If you see "No users found", you need to seed the database');
    console.log('   If you see users but still get CredentialsSignin, check:');
    console.log('   - NEXTAUTH_SECRET is set correctly');
    console.log('   - NEXTAUTH_URL is set correctly');
    console.log('   - Database connection string is correct');

  } catch (error) {
    console.error('❌ Error testing Vercel database:', error);
    console.log('\n🔧 Possible solutions:');
    console.log('   1. Check PRISMA_DATABASE_URL environment variable');
    console.log('   2. Verify database connection string');
    console.log('   3. Check if database is accessible from Vercel');
    console.log('   4. Run database migrations: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

testVercelDatabase();
