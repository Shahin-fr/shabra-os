#!/usr/bin/env node

/**
 * Create Database Script
 * This script creates the SQLite database and users directly
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

// Set environment variables
process.env.DATABASE_URL = 'file:./dev.db';
process.env.POSTGRES_URL = 'file:./dev.db';

const prisma = new PrismaClient();

async function createDatabase() {
  try {
    console.log('🚀 Creating SQLite database...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);

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
    } else {
      console.log('👥 Users already exist, skipping creation...');
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

    // Check database file
    const dbPath = path.join(process.cwd(), 'dev.db');
    if (fs.existsSync(dbPath)) {
      console.log('✅ SQLite database file exists');
      const stats = fs.statSync(dbPath);
      console.log(`   Size: ${stats.size} bytes`);
    } else {
      console.log('❌ SQLite database file not found');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔑 Login credentials:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Manager: ${DEFAULT_MANAGER_EMAIL} / ${DEFAULT_MANAGER_PASSWORD}`);
    console.log(`   User: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the database creation
createDatabase();
