#!/usr/bin/env node

/**
 * Debug Auth Database Script
 * This script helps debug which database NextAuth is using
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Test with different database URLs
const databaseUrls = [
  'file:./dev.db',
  'file:./prisma/dev.db',
  'file:./prisma/dev.db?schema=public',
];

async function debugAuthDatabase() {
  console.log('🔍 Debugging NextAuth database connection...');
  
  for (const dbUrl of databaseUrls) {
    console.log(`\n📊 Testing database URL: ${dbUrl}`);
    
    // Set environment variable
    process.env.DATABASE_URL = dbUrl;
    
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      
      // Check if users exist
      const userCount = await prisma.user.count();
      console.log(`   ✅ Connected - Found ${userCount} users`);
      
      if (userCount > 0) {
        const users = await prisma.user.findMany({
          select: {
            email: true,
            firstName: true,
            lastName: true,
            roles: true,
            isActive: true,
          }
        });
        
        console.log('   👤 Users:');
        users.forEach(user => {
          console.log(`      - ${user.email} (${user.firstName} ${user.lastName}) - ${user.roles} - Active: ${user.isActive}`);
        });
        
        // Test admin user specifically
        const adminUser = await prisma.user.findUnique({
          where: { email: 'admin@shabra.com' },
          select: { password: true, email: true, firstName: true, lastName: true, roles: true }
        });
        
        if (adminUser) {
          const isValid = await bcrypt.compare('admin123', adminUser.password);
          console.log(`   🔐 Admin password test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
        } else {
          console.log('   ❌ Admin user not found');
        }
      }
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n🔧 Recommended fix:');
  console.log('1. Update .env file with correct DATABASE_URL');
  console.log('2. Restart the development server');
  console.log('3. Clear browser cache');
}

// Run the debug
debugAuthDatabase();
