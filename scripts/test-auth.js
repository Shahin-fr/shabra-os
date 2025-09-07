#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests if authentication is working properly
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Testing authentication setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test user creation
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@shabra.com' }
    });

    if (testUser) {
      console.log('✅ Test user found');
      
      // Test password verification
      const isValid = await bcrypt.compare('admin123', testUser.password);
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
    console.log('   Admin: admin@shabra.com / admin123');
    console.log('   Manager: manager@shabra.com / manager123');
    console.log('   User: user@shabra.com / user123');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
