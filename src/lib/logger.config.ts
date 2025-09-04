// Logger configuration for different environments
// Implements: [CRITICAL PRIORITY 8: Production Console Log Eradication]

import { LoggerOptions } from './logger';

export const loggerConfig: Record<string, LoggerOptions> = {
  development: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
    maxBufferSize: 1000,
    flushInterval: 5000,
    includeTimestamp: true,
    includePerformance: true,
    includeSource: true,
    includeUserContext: true,
    sanitizeData: false,
  },

  test: {
    level: 'warn',
    enableConsole: true,
    enableRemote: false,
    maxBufferSize: 100,
    flushInterval: 1000,
    includeTimestamp: false,
    includePerformance: false,
    includeSource: false,
    includeUserContext: false,
    sanitizeData: true,
  },

  production: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
    remoteEndpoint: process.env.LOGGING_ENDPOINT,
    maxBufferSize: 10000,
    flushInterval: 10000,
    includeTimestamp: true,
    includePerformance: false,
    includeSource: true,
    includeUserContext: false,
    sanitizeData: true,
  },
};

// Get logger configuration for current environment
export function getLoggerConfig(): LoggerOptions {
  const env = process.env.NODE_ENV || 'development';
  const config = loggerConfig[env];
  if (!config) {
    const devConfig = loggerConfig.development;
    if (!devConfig) {
      throw new Error('Logger configuration not found');
    }
    return devConfig;
  }
  return config;
}

// Environment-specific overrides
export const environmentOverrides: Partial<LoggerOptions> = {
  // Override for specific environments
  ...(process.env.LOG_LEVEL && { level: process.env.LOG_LEVEL as any }),
  ...(process.env.LOG_ENABLE_CONSOLE && {
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
  }),
  ...(process.env.LOG_REMOTE_ENDPOINT && {
    remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT,
  }),
  ...(process.env.LOG_BUFFER_SIZE && {
    maxBufferSize: parseInt(process.env.LOG_BUFFER_SIZE),
  }),
  ...(process.env.LOG_FLUSH_INTERVAL && {
    flushInterval: parseInt(process.env.LOG_FLUSH_INTERVAL),
  }),
};
