import { NextRequest } from 'next/server';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Enhanced sanitization to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters and patterns
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize email addresses with enhanced security
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeString(email);

  // Additional checks for suspicious patterns
  if (
    sanitizedEmail.includes('javascript') ||
    sanitizedEmail.includes('data:') ||
    sanitizedEmail.includes('vbscript:')
  ) {
    return false;
  }

  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
}

/**
 * Validate and sanitize UUIDs with enhanced security
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const sanitizedUUID = sanitizeString(uuid);

  // Check for suspicious patterns
  if (
    sanitizedUUID.includes('<') ||
    sanitizedUUID.includes('>') ||
    sanitizedUUID.includes('script')
  ) {
    return false;
  }

  return uuidRegex.test(sanitizedUUID);
}

/**
 * Validate and sanitize date strings with enhanced security
 */
export function validateDate(dateString: string): Date | null {
  try {
    const sanitizedDate = sanitizeString(dateString);

    // Check for suspicious patterns
    if (
      sanitizedDate.includes('<') ||
      sanitizedDate.includes('>') ||
      sanitizedDate.includes('script')
    ) {
      return null;
    }

    const date = new Date(sanitizedDate);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Prevent dates too far in the past or future
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 100, 0, 1);
    const maxDate = new Date(now.getFullYear() + 10, 11, 31);

    if (date < minDate || date > maxDate) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize numeric inputs with enhanced security
 */
export function validateNumber(
  input: string | number,
  min?: number,
  max?: number
): number | null {
  try {
    const sanitizedInput =
      typeof input === 'string' ? sanitizeString(input) : input;

    // Check for suspicious patterns in string inputs
    if (
      typeof sanitizedInput === 'string' &&
      (sanitizedInput.includes('<') ||
        sanitizedInput.includes('>') ||
        sanitizedInput.includes('script'))
    ) {
      return null;
    }

    const num =
      typeof sanitizedInput === 'string'
        ? parseFloat(sanitizedInput)
        : sanitizedInput;

    if (isNaN(num) || !isFinite(num)) {
      return null;
    }

    if (min !== undefined && num < min) {
      return null;
    }

    if (max !== undefined && num > max) {
      return null;
    }

    return num;
  } catch {
    return null;
  }
}

/**
 * Generic validation function using Zod schemas
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    let body: any;

    // Try to parse JSON body
    try {
      body = await request.json();
    } catch {
      // If no body, use empty object
      body = {};
    }

    // Validate using Zod schema
    const validatedData = schema.parse(body);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: 'VALIDATION_ERROR',
      }));

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'خطا در اعتبارسنجی داده‌ها',
          code: 'VALIDATION_ERROR',
        },
      ],
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams(
  request: NextRequest,
  requiredParams: string[] = [],
  optionalParams: Record<string, (value: string) => boolean> = {}
): ValidationResult<Record<string, string>> {
  const { searchParams } = new URL(request.url);
  const errors: ValidationError[] = [];
  const validatedParams: Record<string, string> = {};

  // Check required parameters
  for (const param of requiredParams) {
    const value = searchParams.get(param);
    if (!value) {
      errors.push({
        field: param,
        message: `پارامتر ${param} الزامی است`,
        code: 'MISSING_REQUIRED_PARAM',
      });
    } else {
      validatedParams[param] = sanitizeString(value);
    }
  }

  // Validate optional parameters
  for (const [param, validator] of Object.entries(optionalParams)) {
    const value = searchParams.get(param);
    if (value && !validator(value)) {
      errors.push({
        field: param,
        message: `مقدار پارامتر ${param} نامعتبر است`,
        code: 'INVALID_PARAM_VALUE',
      });
    } else if (value) {
      validatedParams[param] = sanitizeString(value);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: validatedParams,
  };
}

/**
 * Common validation schemas for API endpoints
 */
export const commonSchemas = {
  // Story creation/update schema
  storySchema: z.object({
    title: z
      .string()
      .min(1, 'عنوان الزامی است')
      .max(200, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'),
    notes: z
      .string()
      .max(1000, 'یادداشت نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
      .optional(),
    visualNotes: z
      .string()
      .max(1000, 'یادداشت بصری نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
      .optional(),
    link: z.string().url('لینک نامعتبر است').optional(),
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ نامعتبر است'),
    order: z.number().int().min(1, 'ترتیب باید عدد مثبت باشد'),
    projectId: z.string().uuid('شناسه پروژه نامعتبر است').optional(),
    storyTypeId: z.string().uuid('شناسه نوع استوری نامعتبر است').optional(),
  }),

  // Task creation/update schema
  taskSchema: z.object({
    title: z
      .string()
      .min(1, 'عنوان وظیفه الزامی است')
      .max(200, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'),
    description: z
      .string()
      .max(1000, 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
      .optional(),
    projectId: z.string().uuid('شناسه پروژه نامعتبر است'),
    assigneeId: z.string().uuid('شناسه کاربر نامعتبر است').optional(),
    priority: z
      .enum(['low', 'medium', 'high'], { message: 'اولویت نامعتبر است' })
      .default('medium'),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ نامعتبر است')
      .optional(),
  }),

  // Project creation/update schema
  projectSchema: z.object({
    name: z
      .string()
      .min(1, 'نام پروژه الزامی است')
      .max(100, 'نام پروژه نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
    description: z
      .string()
      .max(500, 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ شروع نامعتبر است')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ پایان نامعتبر است')
      .optional(),
    accessLevel: z
      .enum(['PUBLIC', 'PRIVATE', 'RESTRICTED'], {
        message: 'سطح دسترسی نامعتبر است',
      })
      .default('PRIVATE'),
  }),
};

/**
 * Rate limiting helper (basic implementation)
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requestData = this.requests.get(identifier);

    if (!requestData || now > requestData.resetTime) {
      // Reset or create new window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (requestData.count >= this.maxRequests) {
      return false;
    }

    requestData.count++;
    return true;
  }

  getRemaining(identifier: string): number {
    const requestData = this.requests.get(identifier);
    if (!requestData) return this.maxRequests;
    return Math.max(0, this.maxRequests - requestData.count);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
