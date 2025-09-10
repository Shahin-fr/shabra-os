
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding inside Docker...');
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  try {
    // Reset database first
    console.log('🔄 Resetting database...');
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

    // Create manager user
    console.log('Creating manager user...');
    const managerHashedPassword = await bcrypt.hash('manager-password-123', 12);
    await prisma.user.create({
      data: {
        email: 'manager@shabra.com',
        firstName: 'Manager',
        lastName: 'User',
        password: managerHashedPassword,
        roles: 'MANAGER',
        isActive: true,
      },
    });
    console.log('Manager user created successfully');

    // Create sample project
    console.log('Creating sample project...');
    const project = await prisma.project.create({
      data: {
        name: 'Sample Project',
        description: 'A sample project for testing',
        status: 'ACTIVE',
        startDate: new Date(),
        accessLevel: 'PRIVATE',
      },
    });
    console.log('Sample project created successfully');

    // Create sample tasks
    console.log('Creating sample tasks...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@shabra.com' } });
    const userUser = await prisma.user.findUnique({ where: { email: 'user@shabra.com' } });

    const tasks = [
      {
        title: 'Setup local development',
        description: 'Configure local development environment',
        status: 'Done',
        createdBy: adminUser.id,
        projectId: project.id,
      },
      {
        title: 'Test authentication',
        description: 'Test login functionality',
        status: 'InProgress',
        createdBy: adminUser.id,
        assignedTo: userUser.id,
        projectId: project.id,
      },
      {
        title: 'Database seeding',
        description: 'Seed database with initial data',
        status: 'Done',
        createdBy: adminUser.id,
        projectId: project.id,
      },
    ];

    for (const taskData of tasks) {
      await prisma.task.create({
        data: taskData,
      });
    }
    console.log('Sample tasks created successfully');

    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@shabra.com / admin-password-123');
    console.log('   Manager: manager@shabra.com / manager-password-123');
    console.log('   User: user@shabra.com / user-password-123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
