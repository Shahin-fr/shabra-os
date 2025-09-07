#!/usr/bin/env node

/**
 * Complete Local Setup Script
 * This script ensures everything is properly configured for local development
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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
          email: 'admin@shabra.com',
          password: await bcrypt.hash('admin123', 12),
          firstName: 'Admin',
          lastName: 'User',
          roles: 'ADMIN',
          isActive: true,
        },
        {
          email: 'manager@shabra.com',
          password: await bcrypt.hash('manager123', 12),
          firstName: 'Manager',
          lastName: 'User',
          roles: 'MANAGER',
          isActive: true,
        },
        {
          email: 'user@shabra.com',
          password: await bcrypt.hash('user123', 12),
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
      where: { email: 'admin@shabra.com' },
      select: { password: true, email: true, firstName: true, lastName: true, roles: true }
    });

    if (adminUser) {
      const isValid = await bcrypt.compare('admin123', adminUser.password);
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
    console.log('   Admin: admin@shabra.com / admin123');
    console.log('   Manager: manager@shabra.com / manager123');
    console.log('   User: user@shabra.com / user123');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
completeLocalSetup();
