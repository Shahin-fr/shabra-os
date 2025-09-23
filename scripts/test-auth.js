#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests if authentication is working properly
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD
} = require('../src/lib/config/constants');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Testing authentication setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test user creation
    const testUser = await prisma.user.findFirst({
      where: { email: DEFAULT_ADMIN_EMAIL }
    });

    if (testUser) {
      console.log('✅ Test user found');
      
      // Test password verification
      const isValid = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, testUser.password);
      if (isValid) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password verification failed');
      }
    } else {
      console.log('❌ Test user not found');
    }

    console.log('\n🎉 Authentication test completed!');
    console.log('\n📋 You can now login with:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log('   Manager: manager@shabra.com / manager-password-123');
    console.log('   User: user@shabra.com / user-password-123');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
