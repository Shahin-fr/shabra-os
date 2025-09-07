#!/usr/bin/env node

/**
 * Clear Authentication Cache Script
 * This script helps clear authentication-related cache and cookies
 */

const fs = require('fs');
const path = require('path');

function clearAuthCache() {
  console.log('🧹 Clearing authentication cache...');

  // Clear Next.js cache
  const nextCacheDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('🗑️  Clearing Next.js cache...');
    try {
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
      console.log('✅ Next.js cache cleared');
    } catch (error) {
      console.log('⚠️  Could not clear Next.js cache:', error.message);
    }
  }

  // Clear Prisma cache
  const prismaCacheDir = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaCacheDir)) {
    console.log('🗑️  Clearing Prisma cache...');
    try {
      fs.rmSync(prismaCacheDir, { recursive: true, force: true });
      console.log('✅ Prisma cache cleared');
    } catch (error) {
      console.log('⚠️  Could not clear Prisma cache:', error.message);
    }
  }

  // Regenerate Prisma client
  console.log('🔧 Regenerating Prisma client...');
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client regenerated');
  } catch (error) {
    console.log('⚠️  Could not regenerate Prisma client:', error.message);
  }

  console.log('\n🎉 Authentication cache cleared!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart the development server: npm run dev');
  console.log('2. Clear your browser cache (Ctrl + Shift + R)');
  console.log('3. Try logging in again');
  console.log('\n🔑 Test credentials:');
  console.log('   Admin: admin@shabra.com / admin123');
  console.log('   Manager: manager@shabra.com / manager123');
  console.log('   User: user@shabra.com / user123');
}

// Run the cache clearing
clearAuthCache();
