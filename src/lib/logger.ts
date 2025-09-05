// Implements: [CRITICAL PRIORITY 1: Production Console Logging Eradication]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import { getCurrentLoggingConfig, sanitizeLogData } from './config/logging';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  performance?: {
    duration?: number;
    memory?: number;
    operation?: string;
  };
  source?: string;
  userId?: string;
  sessionId?: string;
}

export interface LoggerOptions {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxBufferSize: number;
  flushInterval: number;
  includeTimestamp: boolean;
  includePerformance: boolean;
  includeSource: boolean;
  includeUserContext: boolean;
  sanitizeData: boolean;
}

class Logger {
  private buffer: LogEntry[] = [];
  private options: LoggerOptions;
  private flushTimer?: NodeJS.Timeout;
  private isProduction: boolean;

  constructor(options?: Partial<LoggerOptions>) {
    // Get configuration from centralized config
    const config = getCurrentLoggingConfig();

    this.isProduction = process.env.NODE_ENV === 'production';

    this.options = {
      ...config,
      ...options,
    };

    // Start flush timer if remote logging is enabled
    if (this.options.enableRemote && this.options.flushInterval > 0) {
      this.startFlushTimer();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.options.level];
  }

  private formatMessage(entry: LogEntry): string {
    const parts = [];

    if (this.options.includeTimestamp) {
      parts.push(`[${entry.timestamp}]`);
    }

    parts.push(`[${entry.level.toUpperCase()}]`);

    if (this.options.includeSource && entry.source) {
      parts.push(`[${entry.source}]`);
    }

    parts.push(entry.message);

    if (entry.performance?.duration) {
      parts.push(`(${entry.performance.duration}ms)`);
    }

    return parts.join(' ');
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    // Remove oldest entries if buffer is full
    if (this.buffer.length > this.options.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.options.maxBufferSize);
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.buffer.length === 0 || !this.options.enableRemote) return;

    let entries: LogEntry[] = [];
    try {
      entries = [...this.buffer];
      this.buffer = [];

      if (this.options.remoteEndpoint) {
        await fetch(this.options.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entries),
        });
      }
    } catch (error) {
      // If remote logging fails, add entries back to buffer
      if (entries.length > 0) {
        this.buffer.unshift(...entries);
      }
      // Use structured logging instead of console.error
      this.error(
        'Remote logging failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          context: 'logger',
          operation: 'flushBuffer',
        }
      );
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.options.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  // Public logging methods with source tracking
  debug(message: string, context?: Record<string, any>, source?: string): void {
    this.log('debug', message, context, source);
  }

  info(message: string, context?: Record<string, any>, source?: string): void {
    this.log('info', message, context, source);
  }

  warn(message: string, context?: Record<string, any>, source?: string): void {
    this.log('warn', message, context, source);
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    source?: string
  ): void {
    this.log('error', message, { ...context, error }, source);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    source?: string
  ): void {
    if (!this.shouldLog(level)) return;

    // Sanitize sensitive data in production
    const sanitizedContext = this.options.sanitizeData
      ? sanitizeLogData(context)
      : context;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: sanitizedContext,
      source: source || this.getCallerSource(),
    };

    // Add to buffer for remote logging
    this.addToBuffer(entry);

    // Console logging (only in development, never in production)
    if (this.options.enableConsole && !this.isProduction) {
      const formattedMessage = this.formatMessage(entry);

      // Use a try-catch to prevent console errors from breaking the application
      try {
        switch (level) {
          case 'debug':
            console.warn(formattedMessage, sanitizedContext);
            break;
          case 'info':
            console.warn(formattedMessage, sanitizedContext);
            break;
          case 'warn':
            console.warn(formattedMessage, sanitizedContext);
            break;
          case 'error':
            console.error(formattedMessage, sanitizedContext);
            break;
        }
      } catch (consoleError) {
        // If console logging fails, don't break the application
        // This could happen in restricted environments
        this.addToBuffer({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'Console logging failed',
          context: {
            originalLevel: level,
            originalMessage: message,
            consoleError,
          },
          source: 'logger',
        });
      }
    }
  }

  private getCallerSource(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Find the first line that's not from the logger itself
        for (const line of lines) {
          if (
            line.includes('at ') &&
            !line.includes('Logger.') &&
            !line.includes('logger.ts')
          ) {
            const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
              const [, , filePath, lineNumber] = match;
              if (filePath && lineNumber) {
                const fileName =
                  filePath.split('/').pop()?.split('\\').pop() || 'unknown';
                return `${fileName}:${lineNumber}`;
              }
            }
          }
        }
      }
    } catch {
      // Ignore errors in source detection
    }
    return 'unknown';
  }

  // Performance logging
  time(operation: string, source?: string): () => void {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    return () => {
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      this.info(
        `Operation completed: ${operation}`,
        {
          performance: {
            duration,
            memory: memoryUsed,
            operation,
          },
        },
        source
      );
    };
  }

  // Cleanup
  destroy(): void {
    this.stopFlushTimer();
    this.flushBuffer();
  }

  // Get current buffer for debugging
  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  // Clear buffer
  clearBuffer(): void {
    this.buffer = [];
  }
}

// Create and export logger instance
export const logger = new Logger();

// Export logger class for custom instances
export { Logger };

// Convenience functions for common logging patterns
export const logAuth = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'auth');

export const logUser = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'user');

export const logAPI = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'api');

export const logDB = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'database');

export const logUI = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'ui');

export const logError = (
  message: string,
  error?: Error,
  context?: Record<string, any>,
  source?: string
) => logger.error(message, error, context, source);

export const logApp = (message: string, context?: Record<string, any>) =>
  logger.info(message, context, 'app');
