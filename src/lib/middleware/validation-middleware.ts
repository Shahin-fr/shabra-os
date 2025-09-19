import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Custom validation error class for better error handling
 */
export class ValidationError extends Error {
  public statusCode: number;
  public errors: z.ZodError['errors'];

  constructor(message: string, errors: z.ZodError['errors']) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

/**
 * Validation middleware factory
 * Creates a validation function that can be used in API routes
 */
export function validate<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Validate against the schema
      const validatedData = schema.parse(body);
      
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into user-friendly messages
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Create a user-friendly error message
        const errorMessage = formattedErrors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');

        throw new ValidationError(
          `Validation failed: ${errorMessage}`,
          error.errors
        );
      }

      // Re-throw non-Zod errors
      throw error;
    }
  };
}

/**
 * Query parameter validation middleware
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());
      
      // Validate against the schema with defaults applied
      const validatedData = schema.parse(queryObject);
      
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into user-friendly messages
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Create a user-friendly error message
        const errorMessage = formattedErrors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');

        throw new ValidationError(
          `Query validation failed: ${errorMessage}`,
          error.errors
        );
      }

      // Re-throw non-Zod errors
      throw error;
    }
  };
}

/**
 * Path parameter validation middleware
 * Validates path parameters against a Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (params: Record<string, string>): Promise<T> => {
    try {
      // Validate against the schema
      const validatedData = schema.parse(params);
      
      return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
        // Format Zod validation errors into user-friendly messages
        const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
          code: err.code,
        }));

        // Create a user-friendly error message
        const errorMessage = formattedErrors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');

        throw new ValidationError(
          `Path parameter validation failed: ${errorMessage}`,
          error.errors
        );
      }

      // Re-throw non-Zod errors
      throw error;
    }
  };
}

/**
 * Middleware to validate request body with custom error handling
 * This is a more advanced version that provides better error responses
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ success: true; data: T } | { success: false; errors: any[] }> => {
    try {
      // Parse the request body
      const body = await request.json();
      
      // Validate against the schema
      const validatedData = schema.parse(body);
      
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into user-friendly messages
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          value: 'input' in err ? err.input : undefined,
        }));

        return { success: false, errors: formattedErrors };
      }

      // Re-throw non-Zod errors
      throw error;
    }
  };
}