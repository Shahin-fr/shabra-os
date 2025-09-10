#!/usr/bin/env node

/**
 * PostgreSQL Local Setup Script
 * This script helps set up PostgreSQL for local development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐘 PostgreSQL Local Setup Helper');
console.log('================================');

// Check if PostgreSQL is installed
function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL not found in PATH');
    return false;
  }
}

// Check if PostgreSQL service is running
function checkPostgreSQLService() {
  try {
    execSync('pg_ctl status', { stdio: 'pipe' });
    console.log('✅ PostgreSQL service is running');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL service is not running');
    return false;
  }
}

// Create a sample .env.local with proper PostgreSQL connection
function createSampleEnv() {
  const envContent = `# ========================================
# SHABRA-OS Environment Configuration
# ========================================
# IMPORTANT: Replace with your actual PostgreSQL credentials

# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string (REQUIRED)
# Default PostgreSQL setup (adjust as needed):
DATABASE_URL="postgresql://postgres:password@localhost:5432/shabra_os?schema=public"

# Alternative if you have a different setup:
# DATABASE_URL="postgresql://your_username:your_password@localhost:5432/shabra_os?schema=public"

# ========================================
# AUTHENTICATION & SECURITY
# ========================================
# NextAuth.js secret key (REQUIRED - generate a secure random string)
NEXTAUTH_SECRET="k8x#mP9$vL2@nQ7&hF4!jR5*tY6^wE3#sA8"

# NextAuth.js URL (REQUIRED - for local development)
NEXTAUTH_URL="http://localhost:3000"

# ========================================
# ENVIRONMENT CONFIGURATION
# ========================================
# Node environment
NODE_ENV="development"

# ========================================
# LOGGING CONFIGURATION
# ========================================
# Log level (debug, info, warn, error)
LOG_LEVEL="debug"

# Enable console logging (true/false)
LOG_ENABLE_CONSOLE="true"

# Remote logging endpoint
LOG_REMOTE_ENDPOINT="/api/logs"

# Log buffer size
LOG_BUFFER_SIZE="1000"

# Log flush interval (milliseconds)
LOG_BUFFER_INTERVAL="5000"
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('📁 .env.local already exists, creating backup...');
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with sample PostgreSQL configuration');
}

// Main setup function
async function main() {
  console.log('\n🔍 Checking PostgreSQL installation...');
  
  const isInstalled = checkPostgreSQL();
  const isRunning = checkPostgreSQLService();
  
  if (!isInstalled) {
    console.log('\n📥 PostgreSQL Installation Required');
    console.log('=====================================');
    console.log('Please install PostgreSQL:');
    console.log('1. Download from: https://www.postgresql.org/download/');
    console.log('2. Or use a package manager:');
    console.log('   - Windows: choco install postgresql');
    console.log('   - macOS: brew install postgresql');
    console.log('   - Ubuntu: sudo apt install postgresql postgresql-contrib');
    console.log('\n3. After installation, restart your terminal and run this script again');
    return;
  }
  
  if (!isRunning) {
    console.log('\n🚀 Starting PostgreSQL Service');
    console.log('===============================');
    console.log('Please start PostgreSQL service:');
    console.log('1. Windows: Start PostgreSQL service from Services');
    console.log('2. macOS: brew services start postgresql');
    console.log('3. Ubuntu: sudo systemctl start postgresql');
    console.log('\n4. After starting, run this script again');
    return;
  }
  
  console.log('\n✅ PostgreSQL is ready!');
  console.log('\n📝 Creating .env.local file...');
  createSampleEnv();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env.local with your actual PostgreSQL credentials');
  console.log('2. Create the database: createdb shabra_os');
  console.log('3. Run: npm run db:setup-local');
  console.log('4. Run: npm run dev');
  
  console.log('\n💡 Common PostgreSQL Commands:');
  console.log('- Create database: createdb shabra_os');
  console.log('- Connect to database: psql -d shabra_os');
  console.log('- List databases: psql -l');
  console.log('- Check PostgreSQL status: pg_ctl status');
}

main().catch(console.error);
