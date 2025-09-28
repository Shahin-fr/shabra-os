#!/usr/bin/env node

/**
 * Reset and Seed Database Script
 * 
 * This script provides a clean way to reset the database and seed it
 * without the caching issues that were causing problems.
 */

const { execSync } = require('child_process');

console.log('🔄 Starting database reset and seed process...');

try {
  // Step 1: Reset the database
  console.log('🗑️ Resetting database...');
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  
  // Step 2: Run the robust seed script
  console.log('🌱 Seeding database...');
  execSync('node scripts/seed-robust.js', { stdio: 'inherit' });
  
  console.log('✅ Database reset and seeding completed successfully!');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('  Admin: admin@example.com / Password123');
  console.log('  Employee: employee@example.com / Password123');
} catch (error) {
  console.error('❌ Database reset and seeding failed:', error.message);
  process.exit(1);
}
