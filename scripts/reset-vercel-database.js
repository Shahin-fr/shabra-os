const { PrismaClient } = require('@prisma/client');

async function resetVercelDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting Vercel database...');
    
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
    
    // Create new users with String roles
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
    
    console.log('✅ Users created with String roles');
    console.log('Admin user:', adminUser.email);
    console.log('Regular user:', regularUser.email);
    
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
