#!/usr/bin/env node

/**
 * Alternative seeding script using tsx
 * This is a simpler approach that uses tsx instead of ts-node
 */

const { execSync } = require('child_process');

console.log('🌱 Starting database seeding with tsx...');

try {
  // Ensure Prisma Client is up to date
  console.log('🔄 Regenerating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run the seed script using tsx
  console.log('🌱 Running seed script with tsx...');
  execSync('npx tsx prisma/seed-robust.ts', { stdio: 'inherit' });
  
  console.log('✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  process.exit(1);
}
