// Production fixes for Vercel deployment
// This file contains fixes for common production issues

import { logger } from './logger';

/**
 * Initialize production environment fixes
 */
export function initializeProductionFixes() {
  // Fix for Vercel environment
  if (process.env.VERCEL) {
    // Ensure proper environment variable handling
    if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
    }

    // Log environment status
    logger.info('Production fixes initialized', {
      vercel: true,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    });
  }

  // Fix for missing environment variables in production
  if (process.env.NODE_ENV === 'production') {
    // Set default values for missing required variables
    if (!process.env.LOG_LEVEL) {
      process.env.LOG_LEVEL = 'error';
    }

    if (!process.env.LOG_ENABLE_CONSOLE) {
      process.env.LOG_ENABLE_CONSOLE = 'false';
    }

    if (!process.env.ALLOWED_ORIGINS) {
      process.env.ALLOWED_ORIGINS =
        process.env.NEXTAUTH_URL || 'https://localhost:3000';
    }
  }
}

/**
 * Check if all required environment variables are set
 */
export function validateProductionEnvironment(): {
  isValid: boolean;
  missing: string[];
} {
  const required = [
    'PRISMA_DATABASE_URL',
    'POSTGRES_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Get safe environment configuration for production
 */
export function getSafeEnvironmentConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERCEL: !!process.env.VERCEL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL || '',
    POSTGRES_URL: process.env.POSTGRES_URL || '',
    LOG_LEVEL: process.env.LOG_LEVEL || 'error',
    LOG_ENABLE_CONSOLE: process.env.LOG_ENABLE_CONSOLE === 'true',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  };
}
