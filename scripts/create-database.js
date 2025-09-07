#!/usr/bin/env node

/**
 * Create Database Script
 * This script creates the SQLite database and users directly
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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
    } else {
      console.log('👥 Users already exist, skipping creation...');
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
    console.log('   Admin: admin@shabra.com / admin123');
    console.log('   Manager: manager@shabra.com / manager123');
    console.log('   User: user@shabra.com / user123');

  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the database creation
createDatabase();
