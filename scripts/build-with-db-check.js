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
  
  // Ensure Prisma schema is set to PostgreSQL for Vercel
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Ensure PostgreSQL configuration
    schemaContent = schemaContent.replace(
      /datasource db \{\s*provider\s*=\s*"sqlite"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/,
      `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("POSTGRES_URL")
}`
    );
    
    // Ensure roles field is String for compatibility
    schemaContent = schemaContent.replace(
      /roles\s+Role\s+@default\(EMPLOYEE\)/,
      'roles     String   @default("EMPLOYEE")'
    );
    
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Ensured PostgreSQL configuration for Vercel');
    
    // Regenerate Prisma client after schema change
    console.log('🔄 Regenerating Prisma client...');
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client regenerated successfully');
    } catch (error) {
      console.error('❌ Failed to regenerate Prisma client:', error.message);
    }
    
    // Reset database to ensure compatibility
    console.log('🔄 Resetting database for compatibility...');
    try {
      execSync('node scripts/reset-vercel-database.js', { stdio: 'inherit' });
      console.log('✅ Database reset completed successfully');
    } catch (error) {
      console.error('❌ Failed to reset database:', error.message);
      // Continue with build even if reset fails
    }
  }
  
  // Ensure required environment variables are set
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "temp-secret-for-build-only";
  }
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
  process.env.NODE_ENV = "production";
} else {
  // On local development, use SQLite database
  console.log('🔧 Using SQLite database for local build process...');
  
  // First, switch Prisma schema to SQLite for local development
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Switch to SQLite for local development
    schemaContent = schemaContent.replace(
      /datasource db \{\s*provider\s*=\s*"postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/,
      `datasource db {
  provider  = "sqlite"
  url       = env("DATABASE_URL")
}`
    );
    
    // Switch roles field to String for SQLite compatibility
    schemaContent = schemaContent.replace(
      /roles\s+Role\s+@default\(EMPLOYEE\)/,
      'roles     String   @default("EMPLOYEE")'
    );
    
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Switched to SQLite for local development');
  }
  
  process.env.DATABASE_URL = "file:./dev.db";
  process.env.POSTGRES_URL = "file:./dev.db";
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
