/**
 * Comprehensive Input Validation and Sanitization
 * Prevents SQL injection, XSS, and other injection attacks
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'url' | 'date' | 'boolean';
  custom?: (value: any) => boolean;
  sanitize?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Main input validator class
 */
export class InputValidator {
  private schema: ValidationSchema;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  /**
   * Validate a single field
   */
  validateField(fieldName: string, value: any): ValidationResult {
    const rule = this.schema[fieldName];
    if (!rule) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    // Check required
    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    // Skip validation if value is empty and not required
    if (
      !rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      return { isValid: true, errors: [], sanitizedValue: value };
    }

    // Type validation
    if (rule.type && !this.validateType(value, rule.type)) {
      errors.push(`${fieldName} must be a valid ${rule.type}`);
    }

    // Length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(
          `${fieldName} must be at least ${rule.minLength} characters`
        );
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(
          `${fieldName} must be no more than ${rule.maxLength} characters`
        );
      }
    }

    // Pattern validation
    if (
      rule.pattern &&
      typeof value === 'string' &&
      !rule.pattern.test(value)
    ) {
      errors.push(`${fieldName} format is invalid`);
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push(`${fieldName} validation failed`);
    }

    // Sanitization
    let sanitizedValue = value;
    if (rule.sanitize && typeof value === 'string') {
      sanitizedValue = this.sanitizeString(value);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue,
    };
  }

  /**
   * Validate multiple fields
   */
  validateFields(data: Record<string, any>): {
    isValid: boolean;
    errors: Record<string, string[]>;
    sanitizedData: Record<string, any>;
  } {
    const errors: Record<string, string[]> = {};
    const sanitizedData: Record<string, any> = {};
    let isValid = true;

    for (const [fieldName, _rule] of Object.entries(this.schema)) {
      const value = data[fieldName];
      const result = this.validateField(fieldName, value);

      if (!result.isValid) {
        isValid = false;
        errors[fieldName] = result.errors;
      }

      if (result.sanitizedValue !== undefined) {
        sanitizedData[fieldName] = result.sanitizedValue;
      } else {
        sanitizedData[fieldName] = value;
      }
    }

    return { isValid, errors, sanitizedData };
  }

  /**
   * Validate type
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'email':
        return typeof value === 'string' && this.isValidEmail(value);
      case 'url':
        return typeof value === 'string' && this.isValidUrl(value);
      case 'date':
        return (
          value instanceof Date ||
          (typeof value === 'string' && !isNaN(Date.parse(value)))
        );
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return true;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;

    return (
      input
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }
}

/**
 * Predefined validation schemas for common use cases
 */
export const ValidationSchemas = {
  // User registration
  userRegistration: {
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 255,
      sanitize: true,
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      sanitize: true,
    },
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\u0600-\u06FF\s]+$/,
      sanitize: true,
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\u0600-\u06FF\s]+$/,
      sanitize: true,
    },
  },

  // Project creation
  projectCreation: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\u0600-\u06FF\s\-_]+$/,
      sanitize: true,
    },
    description: {
      required: false,
      maxLength: 1000,
      sanitize: true,
    },
    startDate: {
      required: false,
      type: 'date' as const,
    },
    endDate: {
      required: false,
      type: 'date' as const,
    },
  },

  // Story creation
  storyCreation: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 200,
      sanitize: true,
    },
    content: {
      required: true,
      minLength: 10,
      maxLength: 10000,
      sanitize: true,
    },
    tags: {
      required: false,
      custom: (value: any) => {
        if (!Array.isArray(value)) return false;
        return value.every(tag => typeof tag === 'string' && tag.length <= 50);
      },
    },
  },

  // Search query
  searchQuery: {
    query: {
      required: true,
      minLength: 2,
      maxLength: 100,
      sanitize: true,
    },
    filters: {
      required: false,
      custom: (value: any) => {
        if (typeof value !== 'object' || value === null) return false;
        return true; // Add specific filter validation as needed
      },
    },
  },
};

/**
 * Utility functions for common validation tasks
 */
export class ValidationUtils {
  /**
   * Check if string contains potentially dangerous content
   */
  static containsDangerousContent(input: string): boolean {
    if (typeof input !== 'string') return false;

    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize SQL query parameters
   */
  static sanitizeSqlParam(value: any): any {
    if (typeof value === 'string') {
      // Remove SQL injection patterns
      return value
        .replace(/['";]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .replace(/xp_/gi, '')
        .replace(/sp_/gi, '');
    }
    return value;
  }

  /**
   * Validate and sanitize file upload
   */
  static validateFileUpload(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File size ${file.size} bytes exceeds maximum allowed size ${maxSize} bytes`
      );
    }

    // Check file name for dangerous content
    if (ValidationUtils.containsDangerousContent(file.name)) {
      errors.push('File name contains potentially dangerous content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: file,
    };
  }

  /**
   * Validate API request body
   */
  static validateRequestBody(
    body: any,
    schema: ValidationSchema
  ): ValidationResult {
    const validator = new InputValidator(schema);
    const result = validator.validateFields(body);

    if (!result.isValid) {
      return {
        isValid: false,
        errors: Object.values(result.errors).flat(),
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitizedValue: result.sanitizedData,
    };
  }
}

/**
 * Middleware for validating API requests
 */
export function withValidation(schema: ValidationSchema) {
  return function (handler: Function) {
    return async function (request: Request) {
      try {
        const body = await request.json();
        const validation = ValidationUtils.validateRequestBody(body, schema);

        if (!validation.isValid) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: validation.errors,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        // Replace request body with sanitized data
        const sanitizedRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(validation.sanitizedValue),
        });

        return handler(sanitizedRequest);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Invalid request body',
            details: ['Request body must be valid JSON'],
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    };
  };
}
