import { prisma } from '../src/lib/prisma';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);

    // Test user table access
    const userCount = await prisma.user.count();
    console.log('👥 Users in database:', userCount);

    // Test finding a specific user
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, firstName: true },
    });

    if (testUser) {
      console.log('👤 Sample user found:', testUser);
    } else {
      console.log('⚠️ No users found in database');
    }

    // Test database schema
    console.log('📋 Testing database schema...');

    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log('📊 Available tables:', tables);
    } catch (schemaError) {
      console.log('⚠️ Could not retrieve schema information:', schemaError);
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);

    if (error instanceof Error) {
      console.error('📋 Error details:');
      console.error('  - Message:', error.message);
      console.error('  - Name:', error.name);
      console.error('  - Stack:', error.stack);
    }

    // Provide helpful debugging information
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify your .env.local file has correct DATABASE_URL');
    console.log('3. Ensure database exists and is accessible');
    console.log('4. Check if user has proper permissions');
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
