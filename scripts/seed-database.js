const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@shabra.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: 'ADMIN',
        isActive: true,
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@shabra.com',
        password: await bcrypt.hash('manager123', 12),
        firstName: 'Manager',
        lastName: 'User',
        roles: 'MANAGER',
        isActive: true,
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@shabra.com',
        password: await bcrypt.hash('user123', 12),
        firstName: 'Regular',
        lastName: 'User',
        roles: 'EMPLOYEE',
        isActive: true,
      },
    });

    console.log('👥 Created users');

    // Create projects
    const project1 = await prisma.project.create({
      data: {
        name: 'Project Alpha',
        description: 'Main project for Q1',
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      },
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'Project Beta',
        description: 'Secondary project for Q2',
        status: 'ACTIVE',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-09-30'),
      },
    });

    console.log('📋 Created projects');

    // Create tasks
    await prisma.task.createMany({
      data: [
        {
          title: 'Setup development environment',
          description: 'Configure local development setup',
          status: 'Done',
          projectId: project1.id,
          assignedTo: adminUser.id,
          createdBy: adminUser.id,
          dueDate: new Date('2024-01-15'),
        },
        {
          title: 'Design database schema',
          description: 'Create initial database design',
          status: 'InProgress',
          projectId: project1.id,
          assignedTo: managerUser.id,
          createdBy: adminUser.id,
          dueDate: new Date('2024-02-01'),
        },
        {
          title: 'Implement user authentication',
          description: 'Add login and registration features',
          status: 'Todo',
          projectId: project1.id,
          assignedTo: regularUser.id,
          createdBy: adminUser.id,
          dueDate: new Date('2024-02-15'),
        },
        {
          title: 'Project planning',
          description: 'Plan project structure and timeline',
          status: 'InProgress',
          projectId: project2.id,
          assignedTo: managerUser.id,
          createdBy: managerUser.id,
          dueDate: new Date('2024-04-15'),
        },
        {
          title: 'Research requirements',
          description: 'Gather and analyze project requirements',
          status: 'Todo',
          projectId: project2.id,
          assignedTo: regularUser.id,
          createdBy: managerUser.id,
          dueDate: new Date('2024-05-01'),
        },
      ],
    });

    console.log('✅ Created tasks');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 3 (admin, manager, user)`);
    console.log(`- Projects: 2`);
    console.log(`- Tasks: 5`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
