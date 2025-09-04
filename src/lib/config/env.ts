// Secure environment configuration utility
// Implements: [CRITICAL PRIORITY 8: Secure Credentials]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import { z } from 'zod';

import { logError, logger } from '@/lib/logger';

// Environment variable schema for validation
const envSchema = z.object({
  // Database
  PRISMA_DATABASE_URL: z.string().url('Invalid database URL'),
  POSTGRES_URL: z.string().url('Invalid PostgreSQL URL'),

  // Authentication
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),

  // Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  LOG_ENABLE_CONSOLE: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  LOG_REMOTE_ENDPOINT: z.string().optional(),
  LOG_BUFFER_SIZE: z
    .string()
    .transform(val => parseInt(val, 10))
    .default('1000'),
  LOG_FLUSH_INTERVAL: z
    .string()
    .transform(val => parseInt(val, 10))
    .default('5000'),

  // Security
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001'),

  // Testing
  TEST_DATABASE_URL: z.string().url('Invalid test database URL').optional(),
  TEST_USER_EMAIL: z
    .string()
    .email('Invalid test user email')
    .default('test@shabra.com'),
  TEST_USER_PASSWORD: z
    .string()
    .min(8, 'Test password must be at least 8 characters')
    .default('test-password-123'),

  // Development seeding
  DEV_ADMIN_EMAIL: z
    .string()
    .email('Invalid admin email')
    .default('admin@shabra.com'),
  DEV_ADMIN_PASSWORD: z
    .string()
    .min(8, 'Admin password must be at least 8 characters')
    .default('admin-password-123'),
  DEV_USER_EMAIL: z
    .string()
    .email('Invalid user email')
    .default('user@shabra.com'),
  DEV_USER_PASSWORD: z
    .string()
    .min(8, 'User password must be at least 8 characters')
    .default('user-password-123'),
  DEV_MANAGER_EMAIL: z
    .string()
    .email('Invalid manager email')
    .default('manager@shabra.com'),
  DEV_MANAGER_PASSWORD: z
    .string()
    .min(8, 'Manager password must be at least 8 characters')
    .default('manager-password-123'),

  // Performance & Monitoring
  NEXT_PUBLIC_WS_URL: z.string().default('ws://localhost:3001'),
  PERFORMANCE_ENDPOINT: z.string().default('/api/performance'),

  // External services (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  LOGGING_ENDPOINT: z.string().optional(),
});

// Environment configuration type
export type EnvConfig = z.infer<typeof envSchema>;

// Validate and parse environment variables
function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logError('Environment validation failed', new Error(errorMessage), {
          missingVariables: missingVars,
          context: 'env-validation',
        });

        if (process.env.NODE_ENV === 'production') {
          throw new Error(errorMessage);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️  Using development defaults for missing variables.');
      }
    }

    // Return safe defaults for development
    return {
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL || '',
      POSTGRES_URL: process.env.POSTGRES_URL || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
      LOG_ENABLE_CONSOLE: true,
      LOG_BUFFER_SIZE: 1000,
      LOG_FLUSH_INTERVAL: 5000,
      ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:3001',
      TEST_USER_EMAIL: 'test@shabra.com',
      TEST_USER_PASSWORD: 'test-password-123',
      DEV_ADMIN_EMAIL: 'admin@shabra.com',
      DEV_ADMIN_PASSWORD: 'admin-password-123',
      DEV_USER_EMAIL: 'user@shabra.com',
      DEV_USER_PASSWORD: 'user-password-123',
      DEV_MANAGER_EMAIL: 'manager@shabra.com',
      DEV_MANAGER_PASSWORD: 'manager-password-123',
      NEXT_PUBLIC_WS_URL: 'ws://localhost:3001',
      PERFORMANCE_ENDPOINT: '/api/performance',
    };
  }
}

// Export validated environment configuration
export const env = validateEnv();

// Environment-specific configuration
export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProduction: env.NODE_ENV === 'production',

  // Database
  database: {
    url: env.PRISMA_DATABASE_URL,
    directUrl: env.POSTGRES_URL,
  },

  // Authentication
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    enableConsole: env.LOG_ENABLE_CONSOLE,
    remoteEndpoint: env.LOG_REMOTE_ENDPOINT,
    bufferSize: env.LOG_BUFFER_SIZE,
    flushInterval: env.LOG_FLUSH_INTERVAL,
  },

  // Security
  security: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  },

  // Testing
  testing: {
    databaseUrl: env.TEST_DATABASE_URL,
    userEmail: env.TEST_USER_EMAIL,
    userPassword: env.TEST_USER_PASSWORD,
  },

  // Development seeding
  development: {
    adminEmail: env.DEV_ADMIN_EMAIL,
    adminPassword: env.DEV_ADMIN_PASSWORD,
    userEmail: env.DEV_USER_EMAIL,
    userPassword: env.DEV_USER_PASSWORD,
    managerEmail: env.DEV_MANAGER_EMAIL,
    managerPassword: env.DEV_MANAGER_PASSWORD,
  },

  // Performance & Monitoring
  performance: {
    wsUrl: env.NEXT_PUBLIC_WS_URL,
    endpoint: env.PERFORMANCE_ENDPOINT,
  },

  // External services
  external: {
    gaId: env.NEXT_PUBLIC_GA_ID,
    sentryDsn: env.SENTRY_DSN,
    loggingEndpoint: env.LOGGING_ENDPOINT,
  },
};

// Export configuration for use throughout the application
export default config;

// Utility functions
export const isProduction = () => config.isProduction;
export const isDevelopment = () => config.isDevelopment;
export const isTest = () => config.isTest;

// Secure credential validation
export function validateCredentials() {
  const issues: string[] = [];

  // Check for weak secrets in production
  if (isProduction()) {
    if (env.NEXTAUTH_SECRET.length < 32) {
      issues.push(
        'NEXTAUTH_SECRET is too short for production (minimum 32 characters)'
      );
    }

    if (
      env.NEXTAUTH_SECRET.includes('dev') ||
      env.NEXTAUTH_SECRET.includes('test')
    ) {
      issues.push('NEXTAUTH_SECRET contains development/test keywords');
    }

    if (
      env.PRISMA_DATABASE_URL.includes('localhost') ||
      env.PRISMA_DATABASE_URL.includes('127.0.0.1')
    ) {
      issues.push('Database URL points to localhost in production');
    }
  }

  // Check for default passwords
  const defaultPasswords = ['password123', 'admin', 'test', '123456'];
  const hasDefaultPassword = defaultPasswords.some(
    pwd =>
      env.DEV_ADMIN_PASSWORD === pwd ||
      env.DEV_USER_PASSWORD === pwd ||
      env.DEV_MANAGER_PASSWORD === pwd
  );

  if (hasDefaultPassword) {
    issues.push('Default passwords detected in development credentials');
  }

  if (issues.length > 0) {
    logger.warn('⚠️  Credential validation issues found:');
    issues.forEach(issue => logger.warn(`  - ${issue}`));
  }

  return issues;
}

// Initialize credential validation
if (isDevelopment()) {
  validateCredentials();
}
