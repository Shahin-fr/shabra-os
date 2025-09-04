// Secure credential generation utility
// Implements: [CRITICAL PRIORITY 8: Secure Credentials]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns Secure random string
 */
export function generateSecureString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure password that meets common requirements
 * @param length Length of the password (default: 16)
 * @returns Secure password string
 */
export function generateSecurePassword(length: number = 16): string {
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

/**
 * Generate a secure secret key for NextAuth
 * @returns 64-character secure secret
 */
export function generateNextAuthSecret(): string {
  return generateSecureString(32);
}

/**
 * Generate secure database credentials
 * @returns Object with username and password
 */
export function generateDatabaseCredentials(): {
  username: string;
  password: string;
} {
  return {
    username: `shabra_${generateSecureString(8)}`,
    password: generateSecurePassword(20),
  };
}

/**
 * Generate secure API keys
 * @param prefix Optional prefix for the key
 * @returns Secure API key
 */
export function generateApiKey(prefix: string = 'sk'): string {
  return `${prefix}_${generateSecureString(24)}`;
}

/**
 * Generate secure JWT tokens (for testing)
 * @returns Secure JWT token
 */
export function generateTestJWT(): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'test-user-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64url');
  const signature = generateSecureString(32);

  return `${header}.${payload}.${signature}`;
}

/**
 * Generate secure development credentials for seeding
 * @returns Object with all development user credentials
 */
export function generateDevelopmentCredentials() {
  return {
    admin: {
      email: 'admin@shabra.com',
      password: generateSecurePassword(16),
    },
    user: {
      email: 'user@shabra.com',
      password: generateSecurePassword(16),
    },
    manager: {
      email: 'manager@shabra.com',
      password: generateSecurePassword(16),
    },
    test: {
      email: 'test@shabra.com',
      password: generateSecurePassword(16),
    },
  };
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4 (0=very weak, 4=very strong)
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 1;
  } else {
    score += 0.5;
  }

  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Add lowercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('Add special characters');

  // Common password check
  const commonPasswords = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'hello',
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    issues.push('Password contains common words or patterns');
    score = Math.max(0, score - 1);
  }

  // Sequential character check
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Password contains repeated characters');
    score = Math.max(0, score - 0.5);
  }

  // Keyboard pattern check
  const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '123456'];
  if (
    keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))
  ) {
    issues.push('Password contains keyboard patterns');
    score = Math.max(0, score - 0.5);
  }

  const isValid = score >= 3 && issues.length === 0;

  return {
    isValid,
    score: Math.min(4, Math.max(0, score)),
    issues,
    suggestions,
  };
}

/**
 * Generate a secure environment file content
 * @param environment Environment name (development, test, production)
 * @returns Formatted environment file content
 */
export function generateEnvironmentFile(
  environment: 'development' | 'test' | 'production'
): string {
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

/**
 * Generate secure credentials for immediate use
 * @returns Object with all necessary secure credentials
 */
export function generateAllCredentials() {
  return {
    nextAuthSecret: generateNextAuthSecret(),
    database: generateDatabaseCredentials(),
    apiKey: generateApiKey(),
    development: generateDevelopmentCredentials(),
    testJWT: generateTestJWT(),
  };
}
