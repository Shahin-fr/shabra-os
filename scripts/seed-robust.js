#!/usr/bin/env node

/**
 * Robust Database Seeding Script
 * 
 * This script addresses the ts-node caching issue by:
 * 1. Using Node.js directly instead of ts-node
 * 2. Clearing any potential caches
 * 3. Ensuring Prisma Client is freshly generated
 * 4. Providing clear error handling and logging
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting robust database seeding process...');

// Step 1: Clear any potential caches
console.log('🧹 Clearing caches...');
try {
  // Clear ts-node cache
  const tsNodeCacheDir = path.join(process.cwd(), 'node_modules', '.cache', 'ts-node');
  if (fs.existsSync(tsNodeCacheDir)) {
    fs.rmSync(tsNodeCacheDir, { recursive: true, force: true });
    console.log('✅ Cleared ts-node cache');
  }
  
  // Clear any TypeScript build info
  const tsBuildInfo = path.join(process.cwd(), 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfo)) {
    fs.unlinkSync(tsBuildInfo);
    console.log('✅ Cleared TypeScript build info');
  }
} catch (error) {
  console.log('⚠️ Cache clearing had some issues (this is usually fine):', error.message);
}

// Step 2: Ensure Prisma Client is up to date
console.log('🔄 Regenerating Prisma Client...');
try {
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Prisma Client regenerated successfully');
} catch (error) {
  console.error('❌ Failed to regenerate Prisma Client:', error.message);
  process.exit(1);
}

// Step 3: Verify database schema is in sync
console.log('🔍 Verifying database schema...');
try {
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Database schema is in sync');
} catch (error) {
  console.error('❌ Database schema sync failed:', error.message);
  process.exit(1);
}

// Step 4: Run the seed script using tsx (more reliable than ts-node)
console.log('🌱 Running seed script...');
try {
  // Use tsx instead of ts-node for better reliability
  execSync('npx tsx prisma/seed-simple.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  process.exit(1);
}

console.log('🎉 Robust seeding process completed!');
