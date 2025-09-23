#!/usr/bin/env node

/**
 * Local Database Setup Script
 * This script sets up the local development database with PostgreSQL
 * and creates initial users for testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_MANAGER_PASSWORD,
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_PASSWORD
} = require('../src/lib/config/constants');

// Check if we're in development mode
if (process.env.NODE_ENV === 'production') {
  console.log('❌ This script should only be run in development mode');
  process.exit(1);
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL environment variable is required');
  console.log('   Please set DATABASE_URL in your .env.local file');
  console.log('   Example: DATABASE_URL="postgresql://username:password@localhost:5432/shabra_os?schema=public"');
  process.exit(1);
}

const prisma = new PrismaClient();

async function setupLocalDatabase() {
  try {
    console.log('🚀 Setting up local development database...');
    console.log(`📊 Using database: ${process.env.DATABASE_URL.split('@')[1] || 'PostgreSQL'}`);

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx dotenv-cli -e .env.local -- npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    console.log('🔄 Running database migrations...');
    execSync('npx dotenv-cli -e .env.local -- npx prisma migrate dev --name init', { stdio: 'inherit' });

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    
    if (existingUsers > 0) {
      console.log('👥 Users already exist, skipping seeding...');
      return;
    }

    // Create initial users
    console.log('👥 Creating initial users...');

    const users = [
      {
        email: DEFAULT_ADMIN_EMAIL,
        password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12),
        firstName: 'Admin',
        lastName: 'User',
        roles: 'ADMIN',
        isActive: true,
      },
      {
        email: DEFAULT_MANAGER_EMAIL,
        password: await bcrypt.hash(DEFAULT_MANAGER_PASSWORD, 12),
        firstName: 'Manager',
        lastName: 'User',
        roles: 'MANAGER',
        isActive: true,
      },
      {
        email: DEFAULT_USER_EMAIL,
        password: await bcrypt.hash(DEFAULT_USER_PASSWORD, 12),
        firstName: 'Regular',
        lastName: 'User',
        roles: 'EMPLOYEE',
        isActive: true,
      },
    ];

    for (const userData of users) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${userData.email}`);
    }

    // Create some sample data
    console.log('📊 Creating sample data...');

    // Create a sample project
    const project = await prisma.project.create({
      data: {
        name: 'Sample Project',
        description: 'A sample project for testing',
        status: 'ACTIVE',
        startDate: new Date(),
        accessLevel: 'PRIVATE',
      },
    });

    console.log(`✅ Created project: ${project.name}`);

    // Create some sample tasks
    const tasks = [
      {
        title: 'Setup local development',
        description: 'Configure local development environment',
        status: 'Done',
        createdBy: (await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } })).id,
        projectId: project.id,
      },
      {
        title: 'Test authentication',
        description: 'Test login functionality',
        status: 'InProgress',
        createdBy: (await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } })).id,
        projectId: project.id,
      },
    ];

    for (const taskData of tasks) {
      await prisma.task.create({
        data: taskData,
      });
    }

    console.log('✅ Created sample tasks');

    console.log('\n🎉 Local database setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Manager: ${DEFAULT_MANAGER_EMAIL} / ${DEFAULT_MANAGER_PASSWORD}`);
    console.log(`   User: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);
    console.log('\n🌐 Start the development server with: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up local database:', error);
    console.log('\n💡 Make sure you have:');
    console.log('   1. PostgreSQL running locally');
    console.log('   2. DATABASE_URL set in .env.local');
    console.log('   3. Database created and accessible');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupLocalDatabase();