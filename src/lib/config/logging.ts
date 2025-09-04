// Logging Configuration
// Centralized configuration for all logging across the application

export interface LoggingConfig {
  // Environment-specific settings
  production: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: false;
    enableRemote: boolean;
    remoteEndpoint?: string;
    sanitizeData: true;
  };
  development: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: true;
    enableRemote: false;
    sanitizeData: false;
  };
  test: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: false;
    enableRemote: false;
    sanitizeData: true;
  };

  // Common settings
  common: {
    maxBufferSize: number;
    flushInterval: number;
    includeTimestamp: boolean;
    includePerformance: boolean;
    includeSource: boolean;
    includeUserContext: boolean;
  };
}

export const loggingConfig: LoggingConfig = {
  production: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
    remoteEndpoint: process.env.LOGGING_REMOTE_ENDPOINT,
    sanitizeData: true,
  },
  development: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
    sanitizeData: false,
  },
  test: {
    level: 'error',
    enableConsole: false,
    enableRemote: false,
    sanitizeData: true,
  },
  common: {
    maxBufferSize: 1000,
    flushInterval: 5000,
    includeTimestamp: true,
    includePerformance: true,
    includeSource: true,
    includeUserContext: true,
  },
};

// Get current environment configuration
export function getCurrentLoggingConfig() {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return { ...loggingConfig.common, ...loggingConfig.production };
    case 'test':
      return { ...loggingConfig.common, ...loggingConfig.test };
    case 'development':
    default:
      return { ...loggingConfig.common, ...loggingConfig.development };
  }
}

// Logging categories for different parts of the application
export const LOG_CATEGORIES = {
  AUTH: 'auth',
  USER: 'user',
  API: 'api',
  DATABASE: 'database',
  UI: 'ui',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  SYSTEM: 'system',
} as const;

export type LogCategory = (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];

// Log levels with numeric values for comparison
export const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

// Check if a log level should be logged based on current configuration
export function shouldLog(level: LogLevel): boolean {
  const config = getCurrentLoggingConfig();
  const currentLevel = LOG_LEVELS[config.level];
  const messageLevel = LOG_LEVELS[level];

  return messageLevel >= currentLevel;
}

// Sensitive data patterns to redact in production
export const SENSITIVE_DATA_PATTERNS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'api_key',
  'private_key',
  'access_token',
  'refresh_token',
  'session_id',
  'user_id',
  'email',
] as const;

// Data sanitization function
export function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Check if this key contains sensitive data
    const isSensitive = SENSITIVE_DATA_PATTERNS.some(pattern =>
      lowerKey.includes(pattern)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
