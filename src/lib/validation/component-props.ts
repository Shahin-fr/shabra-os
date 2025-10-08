/**
 * Component Props Runtime Validation
 * Simple runtime validation for UI component props to ensure data integrity
 */

import { z } from 'zod';

/**
 * Base validation result interface
 */
export interface ComponentValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedProps?: Record<string, unknown>;
}

/**
 * Simple component props validator
 * Uses Zod for runtime validation with minimal overhead
 */
export class ComponentPropsValidator {
  private schema: z.ZodSchema;

  constructor(schema: z.ZodSchema) {
    this.schema = schema;
  }

  /**
   * Validate component props at runtime
   */
  validate(props: Record<string, unknown>): ComponentValidationResult {
    try {
      const sanitizedProps = this.schema.parse(props);
      return {
        isValid: true,
        errors: [],
        sanitizedProps
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          sanitizedProps: undefined
        };
      }
      
      return {
        isValid: false,
        errors: ['Unknown validation error'],
        sanitizedProps: undefined
      };
    }
  }

  /**
   * Validate props in development mode only
   */
  validateInDev(props: Record<string, unknown>): ComponentValidationResult {
    if (process.env.NODE_ENV === 'development') {
      return this.validate(props);
    }
    
    return {
      isValid: true,
      errors: [],
      sanitizedProps: props
    };
  }
}

/**
 * Common component prop schemas
 */
export const CommonPropSchemas = {
  // Basic HTML attributes
  className: z.string().optional(),
  style: z.record(z.unknown()).optional(),
  id: z.string().optional(),
  
  // Event handlers
  onClick: z.function().optional(),
  onMouseEnter: z.function().optional(),
  onMouseLeave: z.function().optional(),
  
  // Common UI props
  variant: z.string().optional(),
  size: z.string().optional(),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  
  // Content props
  children: z.unknown().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  
  // Animation props (for motion components)
  animated: z.boolean().optional(),
  duration: z.number().positive().optional(),
  delay: z.number().min(0).optional(),
};

/**
 * Create a validator for a specific component
 */
export function createComponentValidator(
  baseSchema: z.ZodObject<any>,
  customProps?: Record<string, z.ZodSchema>
): ComponentPropsValidator {
  const schema = z.object({
    ...CommonPropSchemas,
    ...customProps
  }).merge(baseSchema);
  
  return new ComponentPropsValidator(schema);
}

/**
 * Simple validation hook for React components
 */
export function useComponentValidation(
  props: Record<string, unknown>,
  validator: ComponentPropsValidator
): ComponentValidationResult {
  return validator.validateInDev(props);
}

/**
 * Type-safe prop validation with error reporting
 */
export function validateComponentProps<T extends Record<string, unknown>>(
  props: T,
  validator: ComponentPropsValidator,
  componentName: string
): T {
  const result = validator.validateInDev(props);
  
  if (!result.isValid) {
    console.warn(`[${componentName}] Invalid props:`, result.errors);
    
    // In development, throw error to catch issues early
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Component validation failed for ${componentName}: ${result.errors.join(', ')}`);
    }
  }
  
  return (result.sanitizedProps as T) || props;
}
