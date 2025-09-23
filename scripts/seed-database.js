#!/usr/bin/env node

/**
 * Database Seeding Script
 * This script seeds the database with initial data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_MANAGER_PASSWORD,
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_PASSWORD
} = require('../src/lib/config/constants');
require('dotenv').config({ path: '.env.local' });

// Fix for Docker connection - use localhost instead of 127.0.0.1 and postgres user
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('127.0.0.1')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('127.0.0.1', 'localhost');
}

// For Docker with trust authentication, use postgres user without password
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/shabra_os?schema=public';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('🔍 Environment check:');
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('  - Full DATABASE_URL:', process.env.DATABASE_URL);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  // Reset database first to ensure compatibility
  console.log('🔄 Resetting database for compatibility...');
  
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
  const adminUser = await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } });
  const userUser = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });

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