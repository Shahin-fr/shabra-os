#!/usr/bin/env node

/**
 * Force Auth Fix Script
 * This script forces NextAuth to use the correct database
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

// Force environment variables
process.env.DATABASE_URL = 'file:./dev.db';
process.env.POSTGRES_URL = 'file:./dev.db';
process.env.NEXTAUTH_SECRET = 'local-development-secret-key-minimum-32-characters-long';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'development';

const prisma = new PrismaClient();

async function forceAuthFix() {
  try {
    console.log('🔧 Force fixing NextAuth database connection...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('👥 Creating users...');
      
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
      console.log('👥 Users already exist, updating passwords...');
      
      // Update passwords to ensure they're correct
      const users = [
        { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD },
        { email: DEFAULT_MANAGER_EMAIL, password: DEFAULT_MANAGER_PASSWORD },
        { email: DEFAULT_USER_EMAIL, password: DEFAULT_USER_PASSWORD },
      ];

      for (const userData of users) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await prisma.user.update({
          where: { email: userData.email },
          data: { password: hashedPassword }
        });
        console.log(`✅ Updated password for: ${userData.email}`);
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

    // Update .env files
    console.log('\n📝 Updating environment files...');
    
    // Update .env
    const envContent = `# Default, non-secret values for all environments
LOG_LEVEL="info"
LOG_ENABLE_CONSOLE="true"
LOG_REMOTE_ENDPOINT="/api/logs"
LOG_BUFFER_SIZE="1000"
LOG_FLUSH_INTERVAL="5000"

# Database configuration for local development
DATABASE_URL="file:./dev.db"
POSTGRES_URL="file:./dev.db"
`;
    fs.writeFileSync('.env', envContent);
    console.log('✅ Updated .env file');

    // Update .env.local
    const envLocalContent = `# ========================================
# SHABRA-OS Local Development Environment
# ========================================
# This file is for local development only
# NEVER commit this file to version control

# ========================================
# DATABASE CONFIGURATION (SQLite for local)
# ========================================
# Using SQLite for local development (easier setup)
DATABASE_URL="file:./dev.db"
POSTGRES_URL="file:./dev.db"

# ========================================
# AUTHENTICATION & SECURITY
# ========================================
# NextAuth.js secret key (local development)
NEXTAUTH_SECRET="local-development-secret-key-minimum-32-characters-long"

# NextAuth.js URL (local development)
NEXTAUTH_URL="http://localhost:3000"

# ========================================
# ENVIRONMENT CONFIGURATION
# ========================================
# Node environment
NODE_ENV="development"

# ========================================
# LOGGING CONFIGURATION
# ========================================
# Log level (debug for local development)
LOG_LEVEL="debug"

# Enable console logging (true for local development)
LOG_ENABLE_CONSOLE="true"

# Remote logging endpoint
LOG_REMOTE_ENDPOINT="/api/logs"

# Log buffer size
LOG_BUFFER_SIZE="1000"

# Log flush interval (milliseconds)
LOG_FLUSH_INTERVAL="5000"

# ========================================
# SECURITY HEADERS
# ========================================
# Allowed origins for CORS (local development)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# ========================================
# DEVELOPMENT SEEDING
# ========================================
# Default admin user credentials (development only)
DEV_ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL}"
DEV_ADMIN_PASSWORD="${DEFAULT_ADMIN_PASSWORD}"

# Default regular user credentials (development only)
DEV_USER_EMAIL="${DEFAULT_USER_EMAIL}"
DEV_USER_PASSWORD="${DEFAULT_USER_PASSWORD}"

# Default manager user credentials (development only)
DEV_MANAGER_EMAIL="${DEFAULT_MANAGER_EMAIL}"
DEV_MANAGER_PASSWORD="${DEFAULT_MANAGER_PASSWORD}"

# ========================================
# PERFORMANCE & MONITORING
# ========================================
# WebSocket URL for real-time collaboration
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Performance monitoring endpoint
PERFORMANCE_ENDPOINT="/api/performance"
`;
    fs.writeFileSync('.env.local', envLocalContent);
    console.log('✅ Updated .env.local file');

    console.log('\n🎉 Force fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart the development server: npm run dev');
    console.log('2. Clear your browser cache (Ctrl + Shift + R)');
    console.log('3. Try logging in again');
    console.log('\n🔑 Login credentials:');
    console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Manager: ${DEFAULT_MANAGER_EMAIL} / ${DEFAULT_MANAGER_PASSWORD}`);
    console.log(`   User: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Force fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the force fix
forceAuthFix();
