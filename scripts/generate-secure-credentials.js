#!/usr/bin/env node

/**
 * Script to generate secure credentials and environment files
 * Implements: [CRITICAL PRIORITY 8: Secure Credentials]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Utility functions
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateSecurePassword(length = 16) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';

  // Ensure at least one character from each category
  password += charset[Math.floor(Math.random() * 26)]; // Uppercase
  password += charset[26 + Math.floor(Math.random() * 26)]; // Lowercase
  password += charset[52 + Math.floor(Math.random() * 10)]; // Number
  password += charset[62 + Math.floor(Math.random() * 32)]; // Special character

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function generateNextAuthSecret() {
  return generateSecureString(32);
}

function generateEnvironmentFile(environment) {
  const timestamp = new Date().toISOString();
  const secret = generateNextAuthSecret();

  return `# Generated on ${timestamp}
# Environment: ${environment}
# ⚠️  IMPORTANT: Change these values in production!

# Database
PRISMA_DATABASE_URL="postgresql://username:password@localhost:5432/shabra_os?schema=public"
POSTGRES_URL="postgresql://username:password@localhost:5432/shabra_os?schema=public"

# Authentication
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="${environment}"

# Logging
LOG_LEVEL="${environment === 'production' ? 'error' : 'debug'}"
LOG_ENABLE_CONSOLE="${environment !== 'production'}"
LOG_REMOTE_ENDPOINT="/api/logs"
LOG_BUFFER_SIZE="1000"
LOG_FLUSH_INTERVAL="5000"

# Security
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Development Credentials (CHANGE THESE!)
DEV_ADMIN_EMAIL="admin@shabra.com"
DEV_ADMIN_PASSWORD="${generateSecurePassword(16)}"
DEV_USER_EMAIL="user@shabra.com"
DEV_USER_PASSWORD="${generateSecurePassword(16)}"
DEV_MANAGER_EMAIL="manager@shabra.com"
DEV_MANAGER_PASSWORD="${generateSecurePassword(16)}"

# Test Credentials
TEST_USER_EMAIL="test@shabra.com"
TEST_USER_PASSWORD="${generateSecurePassword(16)}"

# Performance
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
PERFORMANCE_ENDPOINT="/api/performance"

# External Services (Optional)
NEXT_PUBLIC_GA_ID=""
SENTRY_DSN=""
LOGGING_ENDPOINT=""
`;
}

function main() {
  console.log('🔐 Generating secure credentials...\n');

  const rootDir = path.join(__dirname, '..');

  // Generate development environment file
  const devEnvContent = generateEnvironmentFile('development');
  const devEnvPath = path.join(rootDir, '.env.development');

  fs.writeFileSync(devEnvPath, devEnvContent);
  console.log(`✅ Generated ${devEnvPath}`);

  // Generate test environment file
  const testEnvContent = generateEnvironmentFile('test');
  const testEnvPath = path.join(rootDir, '.env.test');

  fs.writeFileSync(testEnvPath, testEnvContent);
  console.log(`✅ Generated ${testEnvPath}`);

  // Generate production template (without actual secrets)
  const prodEnvContent = generateEnvironmentFile('production');
  const prodEnvPath = path.join(rootDir, '.env.production.template');

  fs.writeFileSync(prodEnvPath, prodEnvContent);
  console.log(`✅ Generated ${prodEnvPath}`);

  // Generate secure credentials summary
  const credentials = {
    nextAuthSecret: generateNextAuthSecret(),
    database: {
      username: `shabra_${generateSecureString(8)}`,
      password: generateSecurePassword(20),
    },
    apiKey: `sk_${generateSecureString(24)}`,
    development: {
      admin: generateSecurePassword(16),
      user: generateSecurePassword(16),
      manager: generateSecurePassword(16),
      test: generateSecurePassword(16),
    },
    timestamp: new Date().toISOString(),
  };

  const credentialsPath = path.join(rootDir, 'secure-credentials.json');
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
  console.log(`✅ Generated ${credentialsPath}`);

  // Generate setup instructions
  const setupInstructions = `# Secure Credentials Setup Instructions

## 🔐 Generated Files

1. **\`.env.development\`** - Development environment configuration
2. **\`.env.test\`** - Test environment configuration  
3. **\`.env.production.template\`** - Production environment template
4. **\`secure-credentials.json\`** - Secure credentials summary

## 🚀 Quick Setup

### 1. Development Environment
\`\`\`bash
cp .env.development .env.local
# Edit .env.local with your actual database credentials
\`\`\`

### 2. Test Environment
\`\`\`bash
cp .env.test .env.test.local
# Edit .env.test.local with your test database credentials
\`\`\`

### 3. Production Environment
\`\`\`bash
cp .env.production.template .env.production
# Edit .env.production with your production credentials
# ⚠️  NEVER commit .env.production to version control!
\`\`\`

## 🔒 Security Notes

- **NEVER commit** \`.env.local\`, \`.env.production\`, or \`secure-credentials.json\` to version control
- **ALWAYS change** default passwords in production
- **Use strong passwords** (minimum 16 characters with mixed case, numbers, and symbols)
- **Rotate secrets** regularly in production environments
- **Monitor access** to credential files

## 📋 Next Steps

1. Copy the appropriate environment file to \`.env.local\`
2. Update database connection strings with your actual credentials
3. Change all default passwords to secure ones
4. Test the application with new credentials
5. Delete \`secure-credentials.json\` after setup

## 🆘 Need Help?

- Check the \`env.template\` file for variable descriptions
- Review the security documentation in \`docs/\`
- Run \`npm run security:audit\` to check for vulnerabilities
`;

  const setupPath = path.join(rootDir, 'SECURE_CREDENTIALS_SETUP.md');
  fs.writeFileSync(setupPath, setupInstructions);
  console.log(`✅ Generated ${setupPath}`);

  console.log('\n🎉 Secure credentials generation completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Copy .env.development to .env.local');
  console.log('   2. Update database credentials in .env.local');
  console.log('   3. Change default passwords');
  console.log('   4. Test the application');
  console.log('   5. Delete secure-credentials.json');
  console.log(
    '\n⚠️  IMPORTANT: Never commit .env files or secure-credentials.json to version control!'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSecureString,
  generateSecurePassword,
  generateNextAuthSecret,
};
