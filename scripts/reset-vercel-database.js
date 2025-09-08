const { PrismaClient } = require('@prisma/client');

async function resetVercelDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting Vercel database...');
    
    // Drop all tables first
    console.log('🗑️ Dropping all tables...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Story" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Task" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "StoryIdea" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "StoryType" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ContentSlot" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Project" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Document" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;`;
    
    console.log('✅ All tables dropped');
    
    // Push schema to recreate tables
    console.log('🔄 Pushing schema to recreate tables...');
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      console.log('✅ Schema pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push schema:', error.message);
      throw error;
    }
    
    // Create new users with String roles
    console.log('👥 Creating users with String roles...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin-password-123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@shabra.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        roles: 'ADMIN',
        isActive: true,
      },
    });
    
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@shabra.com',
        firstName: 'Regular',
        lastName: 'User',
        password: hashedPassword,
        roles: 'EMPLOYEE',
        isActive: true,
      },
    });
    
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@shabra.com',
        firstName: 'Manager',
        lastName: 'User',
        password: hashedPassword,
        roles: 'MANAGER',
        isActive: true,
      },
    });
    
    console.log('✅ Users created with String roles');
    console.log('Admin user:', adminUser.email);
    console.log('Regular user:', regularUser.email);
    console.log('Manager user:', managerUser.email);
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetVercelDatabase()
    .then(() => {
      console.log('🎉 Database reset completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database reset failed:', error);
      process.exit(1);
    });
}

module.exports = { resetVercelDatabase };