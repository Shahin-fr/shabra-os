# Logging System Documentation

## Overview

This document describes the comprehensive logging system implemented for Shabra OS, which eliminates all console statements from production code while providing structured, secure, and performant logging capabilities.

## 🚨 Critical Priority: Production Console Logging Eradication

**Status: ✅ COMPLETED**

All console statements have been removed from production code and replaced with a structured logging system that:

- Prevents information leakage in production
- Improves performance by eliminating console operations
- Provides structured logging for better debugging and monitoring
- Implements data sanitization for security

## Architecture

### Core Components

1. **Enhanced Logger** (`src/lib/logger.ts`)
   - Environment-aware logging (development vs production)
   - Data sanitization for sensitive information
   - Source tracking and performance monitoring
   - Remote logging capabilities

2. **Logging Configuration** (`src/lib/config/logging.ts`)
   - Centralized configuration management
   - Environment-specific settings
   - Sensitive data patterns and sanitization rules

3. **Convenience Functions** (`src/lib/logger.ts`)
   - Domain-specific logging functions
   - Consistent API across the application

### Logging Categories

```typescript
export const LOG_CATEGORIES = {
  AUTH: 'auth', // Authentication and authorization
  USER: 'user', // User-related operations
  API: 'api', // API endpoints and requests
  DATABASE: 'database', // Database operations
  UI: 'ui', // User interface interactions
  PERFORMANCE: 'performance', // Performance metrics
  SECURITY: 'security', // Security-related events
  SYSTEM: 'system', // System-level operations
};
```

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Different log levels
logger.debug('Debug information', { context: 'debug-data' });
logger.info('General information', { context: 'info-data' });
logger.warn('Warning message', { context: 'warning-data' });
logger.error('Error occurred', error, { context: 'error-data' });
```

### Domain-Specific Logging

```typescript
import { logAuth, logUser, logAPI, logDB, logUI, logError } from '@/lib/logger';

// Authentication logging
logAuth('User login attempt', { email: 'user@example.com' });

// User operations
logUser('Profile updated', { userId: '123', fields: ['name', 'avatar'] });

// API operations
logAPI('Request received', { endpoint: '/api/users', method: 'GET' });

// Database operations
logDB('Query executed', { table: 'users', operation: 'SELECT' });

// UI interactions
logUI('Button clicked', { component: 'LoginForm', action: 'submit' });

// Error logging
logError('Database connection failed', error, { context: 'db-connection' });
```

### Performance Logging

```typescript
import { logger } from '@/lib/logger';

const timeOperation = logger.time('database-query', 'database');

try {
  // Perform operation
  const result = await performDatabaseQuery();

  // Log completion with timing
  timeOperation();
} catch (error) {
  logError('Database query failed', error, { context: 'database' });
}
```

### Source Tracking

The logger automatically tracks the source of log messages:

```typescript
// This will automatically include the file and line number
logAuth('User authenticated', { userId: '123' });
// Output: [2024-01-15T10:30:00.000Z] [INFO] [auth.ts:45] User authenticated
```

## Configuration

### Environment-Specific Settings

```typescript
// Production
{
  level: 'error',           // Only log errors
  enableConsole: false,     // No console output
  enableRemote: true,       // Enable remote logging
  sanitizeData: true,       // Sanitize sensitive data
}

// Development
{
  level: 'debug',           // Log everything
  enableConsole: true,      // Enable console output
  enableRemote: false,      // No remote logging
  sanitizeData: false,      // Don't sanitize data
}

// Test
{
  level: 'error',           // Only log errors
  enableConsole: false,     // No console output
  enableRemote: false,      // No remote logging
  sanitizeData: true,       // Sanitize sensitive data
}
```

### Data Sanitization

Sensitive data is automatically redacted in production:

```typescript
// Input data
const userData = {
  email: 'user@example.com',
  password: 'secret123',
  token: 'jwt-token-here',
  profile: { name: 'John Doe' },
};

// In production, sensitive fields are redacted
logUser('User data received', userData);
// Output: { email: '[REDACTED]', password: '[REDACTED]', token: '[REDACTED]', profile: { name: 'John Doe' } }
```

## Migration Guide

### Before (Console Statements)

```typescript
// ❌ OLD: Console logging
console.log('User logged in:', user);
console.error('Login failed:', error);
console.warn('Password is weak');
```

### After (Structured Logging)

```typescript
// ✅ NEW: Structured logging
import { logAuth, logError, logUser } from '@/lib/logger';

logAuth('User logged in', { userId: user.id, email: user.email });
logError('Login failed', error, { email: user.email });
logUser('Password validation warning', {
  userId: user.id,
  reason: 'weak_password',
});
```

### Migration Checklist

- [x] Replace `console.log()` with appropriate logging function
- [x] Replace `console.error()` with `logError()`
- [x] Replace `console.warn()` with appropriate level
- [x] Replace `console.debug()` with `logger.debug()`
- [x] Import logging functions from `@/lib/logger`
- [x] Ensure sensitive data is not logged directly
- [x] Add appropriate context to log messages

## Verification

### Automated Verification

Run the verification script to ensure no console statements remain:

```bash
npm run verify:no-console
```

This script:

1. Scans all source files for console statements
2. Runs ESLint checks
3. Provides detailed reporting
4. Ensures production readiness

### Manual Verification

Check these key areas:

- [ ] Authentication hooks and stores
- [ ] API route handlers
- [ ] Component event handlers
- [ ] Error boundaries
- [ ] Utility functions

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ GOOD: Appropriate log levels
logger.debug('Detailed debugging info', { debugData });
logger.info('General information', { context });
logger.warn("Warning that doesn't break functionality", { context });
logger.error('Error that needs attention', error, { context });
```

### 2. Provide Context

```typescript
// ✅ GOOD: Rich context
logAuth('User authentication failed', {
  email: 'user@example.com',
  reason: 'invalid_password',
  attemptCount: 3,
  ipAddress: '192.168.1.1',
});

// ❌ BAD: Minimal context
logAuth('Auth failed');
```

### 3. Sanitize Sensitive Data

```typescript
// ✅ GOOD: Sanitized data
logUser('User profile updated', {
  userId: '123',
  updatedFields: ['name', 'avatar'],
  // Don't log actual values
});

// ❌ BAD: Sensitive data exposed
logUser('User profile updated', {
  userId: '123',
  oldPassword: 'oldpass123', // Never log passwords
  newPassword: 'newpass123', // Never log passwords
});
```

### 4. Use Domain-Specific Functions

```typescript
// ✅ GOOD: Domain-specific logging
logAuth('User logged in', { userId: '123' });
logAPI('Request processed', { endpoint: '/api/users' });
logDB('Query executed', { table: 'users' });

// ❌ BAD: Generic logging
logger.info('User logged in', { userId: '123' });
logger.info('Request processed', { endpoint: '/api/users' });
logger.info('Query executed', { table: 'users' });
```

## Performance Considerations

### Production Mode

- Console operations are completely disabled
- Log level defaults to 'error' only
- Data sanitization is enabled
- Remote logging can be configured

### Development Mode

- Console operations are enabled for debugging
- Log level defaults to 'debug'
- Data sanitization is disabled
- Remote logging is disabled

### Memory Management

- Log buffer is limited to 1000 entries
- Automatic cleanup of old entries
- Configurable flush intervals for remote logging

## Security Features

### Data Sanitization

Automatically redacts sensitive information:

- Passwords
- Tokens
- API keys
- Session IDs
- User IDs (configurable)
- Email addresses (configurable)

### Environment Isolation

- Production logs never contain sensitive data
- Development logs provide full debugging information
- Test logs are sanitized but detailed

## Monitoring and Alerting

### Remote Logging

Configure remote logging endpoints for production monitoring:

```bash
# Environment variable
LOGGING_REMOTE_ENDPOINT=https://logs.example.com/api/logs
```

### Log Aggregation

Logs are structured for easy aggregation and analysis:

- JSON format for machine processing
- Consistent field names
- Timestamp standardization
- Source tracking

## Troubleshooting

### Common Issues

1. **Logs not appearing in development**
   - Check `NODE_ENV` environment variable
   - Ensure logging level is appropriate
   - Verify console output is enabled

2. **Performance issues in production**
   - Verify console operations are disabled
   - Check log level is set to 'error' only
   - Monitor log buffer size

3. **Missing context in logs**
   - Ensure context object is provided
   - Check source tracking is enabled
   - Verify logging configuration

### Debug Mode

Enable debug logging temporarily:

```typescript
// Override logging level for debugging
const debugLogger = new Logger({
  level: 'debug',
  enableConsole: true,
});
```

## Future Enhancements

### Planned Features

1. **Log Correlation IDs**
   - Track requests across services
   - Correlate logs with user sessions

2. **Advanced Filtering**
   - Filter logs by user, session, or request
   - Custom log level per component

3. **Metrics Integration**
   - Integration with monitoring systems
   - Performance metrics collection

4. **Audit Logging**
   - Compliance logging requirements
   - Data retention policies

## Conclusion

The Production Console Logging Eradication has been successfully completed. The new logging system provides:

- ✅ **Security**: No sensitive data leakage in production
- ✅ **Performance**: Zero console overhead in production
- ✅ **Maintainability**: Structured, consistent logging
- ✅ **Debugging**: Rich context and source tracking
- ✅ **Monitoring**: Remote logging capabilities
- ✅ **Compliance**: Data sanitization and audit trails

This system ensures that Shabra OS is production-ready with enterprise-grade logging capabilities while maintaining excellent developer experience in development environments.
