/**
 * Entity validation schemas and utilities for Shabra OS
 * Provides Zod schemas and validation functions for type safety
 */

import { z } from 'zod';
import { BaseEntity, BaseDTO, BaseCreateDTO, BaseUpdateDTO } from './base';
import { ValidationError } from '@/lib/errors';

// Base validation schemas
export const BaseEntitySchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BaseDTOSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BaseCreateDTOSchema = z.object({
  // No id, createdAt, or updatedAt for creation
});

export const BaseUpdateDTOSchema = z.object({
  // All fields optional for updates
});

// Common field validation schemas
export const EmailSchema = z.string().email('Invalid email format');
export const PhoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');
export const URLSchema = z.string().url('Invalid URL format');
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const NameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters');

// Status and enum schemas
export const StatusSchema = z.enum(['active', 'inactive', 'pending', 'archived']);
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

// File upload schemas
export const FileUploadSchema = z.object({
  id: z.string().cuid(),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().min(0),
  url: z.string().url(),
  publicId: z.string().optional(),
  uploadedAt: z.date(),
});

// Audit field schemas
export const AuditFieldsSchema = z.object({
  createdBy: z.string().cuid().optional(),
  updatedBy: z.string().cuid().optional(),
  deletedAt: z.date().optional(),
  deletedBy: z.string().cuid().optional(),
});

// Soft delete schema
export const SoftDeleteSchema = BaseEntitySchema.extend({
  deletedAt: z.date().optional(),
  deletedBy: z.string().cuid().optional(),
});

// API response schemas
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    field: z.string().optional(),
  }),
});

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export const ApiResponseSchema = z.union([ErrorResponseSchema, SuccessResponseSchema]);

// Validation utility functions
export function validateEntity<T extends BaseEntity>(
  entity: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(entity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Entity validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateDTO<T extends BaseDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(dto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`DTO validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateCreateDTO<T extends BaseCreateDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(dto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Create DTO validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateUpdateDTO<T extends BaseUpdateDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(dto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Update DTO validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Safe validation functions that return validation results
export function safeValidateEntity<T extends BaseEntity>(
  entity: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(entity);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function safeValidateDTO<T extends BaseDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(dto);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function safeValidateCreateDTO<T extends BaseCreateDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(dto);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function safeValidateUpdateDTO<T extends BaseUpdateDTO>(
  dto: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(dto);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

// Validation error formatting
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
}

export function formatValidationError(error: z.ZodError): string {
  return formatValidationErrors(error).join(', ');
}

// Custom validation functions
export function validateEmail(email: string): string {
  const result = EmailSchema.safeParse(email);
  if (!result.success) {
    throw new ValidationError('Invalid email format', { originalError: result.error });
  }
  return result.data;
}

export function validatePhone(phone: string): boolean {
  return PhoneSchema.safeParse(phone).success;
}

export function validateURL(url: string): boolean {
  return URLSchema.safeParse(url).success;
}

export function validateSlug(slug: string): boolean {
  return SlugSchema.safeParse(slug).success;
}

export function validatePassword(password: string): boolean {
  return PasswordSchema.safeParse(password).success;
}

export function validateName(name: string): boolean {
  return NameSchema.safeParse(name).success;
}

// Conditional validation
export function createConditionalSchema<T>(
  condition: (data: any) => boolean,
  schema: z.ZodSchema<T>
): z.ZodSchema<T> {
  return z.any().refine(
    (data) => {
      if (condition(data)) {
        const result = schema.safeParse(data);
        return result.success;
      }
      return true;
    },
    {
      message: 'Conditional validation failed',
    }
  ) as z.ZodSchema<T>;
}

// Array validation
export function validateArray<T>(
  items: unknown[],
  itemSchema: z.ZodSchema<T>
): T[] {
  const schema = z.array(itemSchema);
  return validateEntity(items, schema);
}

export function validateNonEmptyArray<T>(
  items: unknown[],
  itemSchema: z.ZodSchema<T>
): [T, ...T[]] {
  const schema = z.array(itemSchema).min(1);
  const result = validateEntity(items, schema);
  return result as [T, ...T[]];
}

// Object validation with partial fields
export function validatePartialObject<T>(
  obj: unknown,
  schema: z.ZodSchema<T>
): Partial<T> {
  const partialSchema = schema.partial();
  return validateEntity(obj, partialSchema);
}

// Validation with custom error messages
export function createCustomSchema<T>(
  schema: z.ZodSchema<T>,
  customErrorMap: (issue: z.ZodIssue, ctx: z.ErrorMapCtx) => z.ZodErrorMapReturn
): z.ZodSchema<T> {
  return schema.setErrorMap(customErrorMap);
}

// Validation with transformation
export function createTransformSchema<T, U>(
  schema: z.ZodSchema<T>,
  transform: (data: T) => U
): z.ZodSchema<U> {
  return schema.transform(transform);
}

// Validation with refinement
export function createRefinedSchema<T>(
  schema: z.ZodSchema<T>,
  refinement: (data: T) => boolean,
  message: string
): z.ZodSchema<T> {
  return schema.refine(refinement, { message });
}

// Validation with multiple refinements
export function createMultiRefinedSchema<T>(
  schema: z.ZodSchema<T>,
  refinements: Array<{ check: (data: T) => boolean; message: string }>
): z.ZodSchema<T> {
  let refinedSchema = schema;
  
  for (const refinement of refinements) {
    refinedSchema = refinedSchema.refine(refinement.check, { message: refinement.message });
  }
  
  return refinedSchema;
}
