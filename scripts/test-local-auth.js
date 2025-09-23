#!/usr/bin/env node

/**
 * Local Authentication Test Script
 * Tests if authentication is working properly on localhost
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD
} = require('../src/lib/config/constants');

// Set environment variables for local development
process.env.DATABASE_URL = 'file:./dev.db';
process.env.POSTGRES_URL = 'file:./dev.db';

const prisma = new PrismaClient();

async function testLocalAuth() {
  try {
    console.log('🧪 Testing local authentication setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test user existence
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
      }
    });

    console.log(`✅ Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - ${user.roles} - Active: ${user.isActive}`);
    });

    // Test password verification for admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL },
      select: { password: true, email: true }
    });

    if (adminUser) {
      const isValid = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, adminUser.password);
      console.log(`✅ Password verification for admin: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('❌ Admin user not found');
    }

    // Test NextAuth configuration
    console.log('\n🔧 NextAuth Configuration:');
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL || 'NOT SET'}`);

    console.log('\n🎉 Local authentication test completed!');
    console.log('\n📋 You can now test login at:');
    console.log('   http://localhost:3001/login');
    console.log('\n🔑 Test credentials:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log('   Manager: manager@shabra.com / manager-password-123');
    console.log('   User: user@shabra.com / user-password-123');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testLocalAuth();
