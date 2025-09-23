
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_MANAGER_PASSWORD,
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_PASSWORD
} = require('./src/lib/config/constants');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

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
  const adminHashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEFAULT_ADMIN_EMAIL,
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
  const userHashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
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
  const managerHashedPassword = await bcrypt.hash(DEFAULT_MANAGER_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEFAULT_MANAGER_EMAIL,
      firstName: 'Manager',
      lastName: 'User',
      password: managerHashedPassword,
      roles: 'MANAGER',
      isActive: true,
    },
  });
  console.log('Manager user created successfully');

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Login credentials:');
  console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  console.log(`   Manager: ${DEFAULT_MANAGER_EMAIL} / ${DEFAULT_MANAGER_PASSWORD}`);
  console.log(`   User: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
