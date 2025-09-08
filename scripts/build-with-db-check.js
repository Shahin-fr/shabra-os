#!/usr/bin/env node

/**
 * Build script that handles database connection issues during Vercel builds
 * This script ensures the build can complete with proper database configuration
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

if (isVercel) {
  // On Vercel, use the real PostgreSQL database
  console.log('🌐 Using PostgreSQL database on Vercel...');
  console.log('✅ Database URL will be used as provided by Vercel');
  
  // Ensure required environment variables are set
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "temp-secret-for-build-only";
  }
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
  process.env.NODE_ENV = "production";
} else {
  // On local development, use mock database for builds to avoid connection issues
  console.log('🔧 Using mock database for local build process...');
  process.env.DATABASE_URL = "mock://database";
  process.env.POSTGRES_URL = "mock://database";
  process.env.NEXTAUTH_SECRET = "temp-secret-for-build-only";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  process.env.NODE_ENV = "production";
}

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
