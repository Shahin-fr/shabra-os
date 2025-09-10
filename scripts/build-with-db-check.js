#!/usr/bin/env node

/**
 * Simplified build script for PostgreSQL-only architecture
 * This script ensures the build can complete with proper database configuration
 */

const { execSync } = require('child_process');

console.log('🔧 Starting build process with PostgreSQL database...');

// Check if we have a valid database URL
const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL !== '';
console.log(`Database URL present: ${hasDatabaseUrl}`);

if (!hasDatabaseUrl) {
  console.log('⚠️  No DATABASE_URL found. Build will use mock database for compilation.');
  console.log('   Make sure to set DATABASE_URL in your environment for full functionality.');
}

// Ensure required environment variables are set for build
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "temp-secret-for-build-only";
  console.log('⚠️  Using temporary NEXTAUTH_SECRET for build');
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  console.log('⚠️  Using temporary NEXTAUTH_URL for build');
}

process.env.NODE_ENV = "production";

try {
  console.log('📦 Running Next.js build...');
  
  // Check if ESLint is available
  try {
    execSync('npx eslint --version', { stdio: 'pipe' });
    console.log('✅ ESLint is available');
  } catch (eslintError) {
    console.log('⚠️  ESLint not found, installing...');
    execSync('npm install --save-dev eslint', { stdio: 'inherit' });
  }
  
  // Run the build command
  execSync('npx next build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary files
  if (require('fs').existsSync('.env.build')) {
    require('fs').unlinkSync('.env.build');
    console.log('🧹 Cleaned up temporary build files');
  }
}