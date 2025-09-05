#!/usr/bin/env node

/**
 * Production Authentication Debugging Script
 * 
 * This script helps debug authentication issues in production by:
 * 1. Testing database connectivity
 * 2. Validating environment variables
 * 3. Testing user authentication flow
 * 4. Checking NextAuth configuration
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkEnvironmentVariables() {
  logSection('ENVIRONMENT VARIABLES CHECK');
  
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
    'NODE_ENV'
  ];
  
  const optionalVars = [
    'VERCEL',
    'PRISMA_DATABASE_URL',
    'POSTGRES_URL'
  ];
  
  let allRequired = true;
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== 'undefined') {
      logSuccess(`${varName}: ${varName.includes('SECRET') ? '***HIDDEN***' : value}`);
    } else {
      logError(`${varName}: NOT SET or INVALID`);
      allRequired = false;
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && value !== 'undefined') {
      logInfo(`${varName}: ${value}`);
    } else {
      logWarning(`${varName}: NOT SET`);
    }
  }
  
  if (!allRequired) {
    logError('Missing required environment variables!');
    return false;
  }
  
  logSuccess('All required environment variables are set');
  return true;
}

async function testDatabaseConnection() {
  logSection('DATABASE CONNECTION TEST');
  
  let prisma;
  try {
    logInfo('Initializing Prisma client...');
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL,
        },
      },
    });
    
    logInfo('Connecting to database...');
    await prisma.$connect();
    logSuccess('Database connection successful');
    
    // Test a simple query
    logInfo('Testing database query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logSuccess(`Query result: ${JSON.stringify(result)}`);
    
    // Test user table access
    logInfo('Testing user table access...');
    const userCount = await prisma.user.count();
    logSuccess(`User count: ${userCount}`);
    
    return { success: true, prisma };
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    logError(`Error details: ${error.stack}`);
    return { success: false, error: error.message };
  }
}

async function testUserAuthentication(prisma, testEmail, testPassword) {
  logSection('USER AUTHENTICATION TEST');
  
  try {
    logInfo(`Testing authentication for user: ${testEmail}`);
    
    // Find user
    logInfo('Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        isActive: true,
        roles: true,
      },
    });
    
    if (!user) {
      logError('User not found in database');
      return { success: false, reason: 'User not found' };
    }
    
    logSuccess(`User found: ${user.email} (ID: ${user.id})`);
    logInfo(`User active: ${user.isActive}`);
    logInfo(`User roles: ${JSON.stringify(user.roles)}`);
    
    if (!user.isActive) {
      logError('User is not active');
      return { success: false, reason: 'User not active' };
    }
    
    if (!user.password) {
      logError('User has no password set');
      return { success: false, reason: 'No password' };
    }
    
    // Test password comparison
    logInfo('Testing password comparison...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (isPasswordValid) {
      logSuccess('Password comparison successful');
      return { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          roles: user.roles || [],
        }
      };
    } else {
      logError('Password comparison failed');
      return { success: false, reason: 'Invalid password' };
    }
    
  } catch (error) {
    logError(`Authentication test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testNextAuthConfiguration() {
  logSection('NEXTAUTH CONFIGURATION TEST');
  
  try {
    // Check if NextAuth can be imported
    logInfo('Testing NextAuth import...');
    const NextAuth = require('next-auth');
    logSuccess('NextAuth imported successfully');
    
    // Check environment variables for NextAuth
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    
    if (!nextAuthUrl) {
      logError('NEXTAUTH_URL is not set');
      return false;
    }
    
    if (!nextAuthSecret) {
      logError('NEXTAUTH_SECRET is not set');
      return false;
    }
    
    if (nextAuthSecret.length < 32) {
      logWarning('NEXTAUTH_SECRET is less than 32 characters (recommended minimum)');
    }
    
    logSuccess(`NEXTAUTH_URL: ${nextAuthUrl}`);
    logSuccess(`NEXTAUTH_SECRET: ${'*'.repeat(nextAuthSecret.length)}`);
    
    return true;
  } catch (error) {
    logError(`NextAuth configuration test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🔍 PRODUCTION AUTHENTICATION DEBUGGING SCRIPT', 'bright');
  log('This script will help identify authentication issues in production\n', 'cyan');
  
  // Step 1: Check environment variables
  const envCheck = await checkEnvironmentVariables();
  if (!envCheck) {
    logError('Environment check failed. Please fix environment variables first.');
    process.exit(1);
  }
  
  // Step 2: Test database connection
  const dbTest = await testDatabaseConnection();
  if (!dbTest.success) {
    logError('Database connection failed. Please check your database configuration.');
    process.exit(1);
  }
  
  // Step 3: Test NextAuth configuration
  const nextAuthTest = await testNextAuthConfiguration();
  if (!nextAuthTest) {
    logError('NextAuth configuration test failed.');
    process.exit(1);
  }
  
  // Step 4: Test user authentication (if test credentials provided)
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  
  if (testEmail && testPassword) {
    const authTest = await testUserAuthentication(dbTest.prisma, testEmail, testPassword);
    if (authTest.success) {
      logSuccess('User authentication test passed');
      logInfo(`Authenticated user: ${JSON.stringify(authTest.user, null, 2)}`);
    } else {
      logError(`User authentication test failed: ${authTest.reason || authTest.error}`);
    }
  } else {
    logWarning('No test credentials provided. Set TEST_USER_EMAIL and TEST_USER_PASSWORD to test authentication.');
  }
  
  // Cleanup
  if (dbTest.prisma) {
    await dbTest.prisma.$disconnect();
  }
  
  logSection('DEBUGGING COMPLETE');
  logSuccess('All tests completed. Check the output above for any issues.');
  logInfo('If you see any errors, please check:');
  logInfo('1. Environment variables in Vercel dashboard');
  logInfo('2. Database connection string');
  logInfo('3. User data in the database');
  logInfo('4. NextAuth configuration');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});
