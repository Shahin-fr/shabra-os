#!/usr/bin/env node

/**
 * Build script that handles database connection issues during Vercel builds
 * This script ensures the build can complete even without a database connection
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting build process with database connection handling...');

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL !== '';

console.log(`Environment: ${isVercel ? 'Vercel' : 'Local'}`);
console.log(`Database URL present: ${hasDatabaseUrl}`);

// Always use mock database for builds to avoid connection issues
console.log('🔧 Using mock database for build process to avoid connection issues...');
process.env.DATABASE_URL = "mock://database";
process.env.POSTGRES_URL = "mock://database";
process.env.NEXTAUTH_SECRET = "temp-secret-for-build-only";
process.env.NEXTAUTH_URL = "http://localhost:3000";
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
  if (fs.existsSync('.env.build')) {
    fs.unlinkSync('.env.build');
    console.log('🧹 Cleaned up temporary build files');
  }
}
