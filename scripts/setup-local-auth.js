#!/usr/bin/env node

/**
 * Local Authentication Setup Script
 * This script ensures authentication works properly in local development
 */

const fs = require('fs');
const path = require('path');

function setupLocalAuth() {
  console.log('🔐 Setting up local authentication...');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found. Please run the environment setup first.');
    process.exit(1);
  }

  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Ensure required auth variables are set
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DEV_ADMIN_EMAIL',
    'DEV_ADMIN_PASSWORD',
    'DEV_USER_EMAIL',
    'DEV_USER_PASSWORD',
    'DEV_MANAGER_EMAIL',
    'DEV_MANAGER_PASSWORD'
  ];

  let needsUpdate = false;

  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      console.log(`⚠️  Missing ${varName}, adding default value...`);
      
      let defaultValue = '';
      switch (varName) {
        case 'NEXTAUTH_SECRET':
          defaultValue = 'local-development-secret-key-minimum-32-characters-long';
          break;
        case 'NEXTAUTH_URL':
          defaultValue = 'http://localhost:3000';
          break;
        case 'DEV_ADMIN_EMAIL':
          defaultValue = 'admin@shabra.com';
          break;
        case 'DEV_ADMIN_PASSWORD':
          defaultValue = 'admin123';
          break;
        case 'DEV_USER_EMAIL':
          defaultValue = 'user@shabra.com';
          break;
        case 'DEV_USER_PASSWORD':
          defaultValue = 'user123';
          break;
        case 'DEV_MANAGER_EMAIL':
          defaultValue = 'manager@shabra.com';
          break;
        case 'DEV_MANAGER_PASSWORD':
          defaultValue = 'manager123';
          break;
      }
      
      envContent += `\n${varName}="${defaultValue}"`;
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables updated');
  } else {
    console.log('✅ All required environment variables are present');
  }

  // Create a simple auth test script
  const authTestScript = `#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests if authentication is working properly
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Testing authentication setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test user creation
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@shabra.com' }
    });

    if (testUser) {
      console.log('✅ Test user found');
      
      // Test password verification
      const isValid = await bcrypt.compare('admin123', testUser.password);
      if (isValid) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password verification failed');
      }
    } else {
      console.log('❌ Test user not found');
    }

    console.log('\\n🎉 Authentication test completed!');
    console.log('\\n📋 You can now login with:');
    console.log('   Admin: admin@shabra.com / admin123');
    console.log('   Manager: manager@shabra.com / manager123');
    console.log('   User: user@shabra.com / user123');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
`;

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'test-auth.js'), authTestScript);
  console.log('✅ Auth test script created');

  console.log('\\n🎉 Local authentication setup completed!');
  console.log('\\n📋 Next steps:');
  console.log('1. Run: npm run db:setup-local');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000/login');
}

// Run the setup
setupLocalAuth();
