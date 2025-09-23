#!/usr/bin/env node

/**
 * Complete Local Setup Script
 * This script ensures everything is properly configured for local development
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
const fs = require('fs');
const path = require('path');

// Set environment variables for local development
process.env.DATABASE_URL = 'file:./dev.db';
process.env.POSTGRES_URL = 'file:./dev.db';
process.env.NEXTAUTH_SECRET = 'local-development-secret-key-minimum-32-characters-long';
process.env.NEXTAUTH_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'development';

const prisma = new PrismaClient();

async function completeLocalSetup() {
  try {
    console.log('🚀 Completing local development setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    if (userCount === 0) {
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
        await prisma.user.create({ data: userData });
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // Test authentication
    console.log('\n🧪 Testing authentication...');
    const adminUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL },
      select: { password: true, email: true, firstName: true, lastName: true, roles: true }
    });

    if (adminUser) {
      const isValid = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, adminUser.password);
      console.log(`✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      
      if (isValid) {
        console.log(`✅ User data: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.roles})`);
      }
    }

    // Check environment file
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env.local file exists');
    } else {
      console.log('❌ .env.local file not found');
    }

    // Check database file
    const dbPath = path.join(process.cwd(), 'dev.db');
    if (fs.existsSync(dbPath)) {
      console.log('✅ SQLite database file exists');
    } else {
      console.log('❌ SQLite database file not found');
    }

    console.log('\n🎉 Local setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure the development server is running: npm run dev');
    console.log('2. Open your browser to: http://localhost:3001');
    console.log('3. Go to login page: http://localhost:3001/login');
    console.log('\n🔑 Login credentials:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Manager: ${DEFAULT_MANAGER_EMAIL} / ${DEFAULT_MANAGER_PASSWORD}`);
    console.log(`   User: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
completeLocalSetup();
