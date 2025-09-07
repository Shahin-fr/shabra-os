#!/usr/bin/env node

/**
 * Database Configuration Setup Script
 * This script automatically configures Prisma schema based on environment
 * - Local development: SQLite
 * - Production (Vercel): PostgreSQL
 */

const fs = require('fs');
const path = require('path');

function setupDatabaseConfig() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Prisma schema file not found');
    process.exit(1);
  }

  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Check if we're in production (Vercel)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (isProduction) {
    console.log('🌐 Configuring for production (PostgreSQL)...');
    
    // Update to PostgreSQL configuration
    schemaContent = schemaContent.replace(
      /datasource db \{\s*provider\s*=\s*"sqlite"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/,
      `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("POSTGRES_URL")
}`
    );
  } else {
    console.log('💻 Configuring for local development (SQLite)...');
    
    // Update to SQLite configuration
    schemaContent = schemaContent.replace(
      /datasource db \{\s*provider\s*=\s*"postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*directUrl\s*=\s*env\("POSTGRES_URL"\)\s*\}/,
      `datasource db {
  provider  = "sqlite"
  url       = env("DATABASE_URL")
}`
    );
  }

  // Write the updated schema
  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ Database configuration updated successfully');
}

// Run the setup
setupDatabaseConfig();
