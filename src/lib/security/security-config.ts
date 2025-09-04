/**
 * Security Configuration and Utilities
 * Centralized security settings for the application
 */

export interface SecurityConfig {
  // Authentication settings
  auth: {
    sessionMaxAge: number; // seconds
    jwtMaxAge: number; // seconds
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDuration: number; // seconds
  };

  // Input validation settings
  validation: {
    maxStringLength: number;
    maxArrayLength: number;
    maxObjectDepth: number;
    allowedFileTypes: string[];
    maxFileSize: number; // bytes
  };

  // Rate limiting settings
  rateLimit: {
    windowMs: number; // milliseconds
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };

  // CORS settings
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

export const securityConfig: SecurityConfig = {
  auth: {
    sessionMaxAge: 24 * 60 * 60, // 24 hours
    jwtMaxAge: 24 * 60 * 60, // 24 hours
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
  },

  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 5,
    allowedFileTypes: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.pdf',
      '.doc',
      '.docx',
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
};

/**
 * Security utility functions
 */
export class SecurityUtils {
  /**
   * Check if a string contains potentially dangerous content
   */
  static isDangerousContent(input: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+=/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize HTML content safely
   */
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove all HTML tags and dangerous content
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(
    fileName: string,
    fileSize: number,
    mimeType: string
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (fileSize > securityConfig.validation.maxFileSize) {
      return {
        isValid: false,
        error: 'File size exceeds maximum allowed size',
      };
    }

    // Check file extension
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf('.'));
    if (!securityConfig.validation.allowedFileTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File type not allowed',
      };
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return {
        isValid: false,
        error: 'MIME type not allowed',
      };
    }

    return { isValid: true };
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
      const randomIndex = randomArray[i] ?? 0;
      result += chars[randomIndex % chars.length];
    }

    return result;
  }

  /**
   * Check if user has required permissions
   */
  static hasPermission(userRoles: string[], requiredRoles: string[]): boolean {
    return userRoles.some(role => requiredRoles.includes(role));
  }
}

/**
 * Security middleware for API routes
 */
export function createSecurityMiddleware() {
  // Input validation function (defined first for recursive calls)
  function validateInput(input: any, maxDepth: number = 0): boolean {
    if (maxDepth > securityConfig.validation.maxObjectDepth) {
      return false;
    }

    if (typeof input === 'string') {
      if (input.length > securityConfig.validation.maxStringLength) {
        return false;
      }
      if (SecurityUtils.isDangerousContent(input)) {
        return false;
      }
    }

    if (Array.isArray(input)) {
      if (input.length > securityConfig.validation.maxArrayLength) {
        return false;
      }
      return input.every(item => validateInput(item, maxDepth + 1));
    }

    if (typeof input === 'object' && input !== null) {
      return Object.values(input).every(value =>
        validateInput(value, maxDepth + 1)
      );
    }

    return true;
  }

  return {
    // Rate limiting check
    checkRateLimit: (identifier: string, requests: Map<string, any>) => {
      const now = Date.now();
      const windowStart = now - securityConfig.rateLimit.windowMs;

      // Clean old requests
      for (const [key, data] of requests.entries()) {
        if (data.timestamp < windowStart) {
          requests.delete(key);
        }
      }

      const userRequests = requests.get(identifier) || {
        count: 0,
        timestamp: now,
      };

      if (userRequests.timestamp < windowStart) {
        userRequests.count = 1;
        userRequests.timestamp = now;
      } else {
        userRequests.count++;
      }

      requests.set(identifier, userRequests);

      return userRequests.count <= securityConfig.rateLimit.maxRequests;
    },

    // Input validation
    validateInput,
  };
}
