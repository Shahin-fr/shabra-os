#!/usr/bin/env node

/**
 * Find Database Script
 * This script finds where the SQLite database is actually located
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Set environment variables
process.env.DATABASE_URL = 'file:./dev.db';
process.env.POSTGRES_URL = 'file:./dev.db';

const prisma = new PrismaClient();

async function findDatabase() {
  try {
    console.log('🔍 Finding SQLite database location...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('Current working directory:', process.cwd());

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Get database info
    const result = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('📊 Tables in database:', result);

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);

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
      
      console.log('👤 Users in database:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - ${user.roles} - Active: ${user.isActive}`);
      });
    }

    // Try to find database file
    const possiblePaths = [
      './dev.db',
      './prisma/dev.db',
      '../dev.db',
      '../../dev.db',
      path.join(process.cwd(), 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
    ];

    console.log('\n🔍 Searching for database file...');
    for (const dbPath of possiblePaths) {
      if (fs.existsSync(dbPath)) {
        console.log(`✅ Found database at: ${dbPath}`);
        const stats = fs.statSync(dbPath);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Modified: ${stats.mtime}`);
      } else {
        console.log(`❌ Not found: ${dbPath}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the search
findDatabase();
