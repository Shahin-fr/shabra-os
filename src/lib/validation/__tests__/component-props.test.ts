/**
 * Tests for Component Props Runtime Validation
 */

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { 
  ComponentPropsValidator, 
  createComponentValidator, 
  validateComponentProps,
  CommonPropSchemas 
} from '../component-props';

describe('ComponentPropsValidator', () => {
  it('should validate props successfully with valid data', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
      active: z.boolean()
    });
    
    const validator = new ComponentPropsValidator(schema);
    const props = {
      title: 'Test Title',
      count: 42,
      active: true
    };
    
    const result = validator.validate(props);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitizedProps).toEqual(props);
  });

  it('should return validation errors for invalid data', () => {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      count: z.number().positive('Count must be positive'),
      active: z.boolean()
    });
    
    const validator = new ComponentPropsValidator(schema);
    const props = {
      title: '',
      count: -1,
      active: 'not-a-boolean'
    };
    
    const result = validator.validate(props);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.sanitizedProps).toBeUndefined();
  });

  it('should skip validation in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const schema = z.object({
      title: z.string().min(1, 'Title is required')
    });
    
    const validator = new ComponentPropsValidator(schema);
    const props = { title: '' }; // Invalid data
    
    const result = validator.validateInDev(props);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitizedProps).toEqual(props);
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('createComponentValidator', () => {
  it('should create validator with common props and custom props', () => {
    const baseSchema = z.object({
      title: z.string(),
      variant: z.enum(['primary', 'secondary'])
    });
    
    const customProps = {
      customProp: z.string().optional()
    };
    
    const validator = createComponentValidator(baseSchema, customProps);
    
    const props = {
      title: 'Test',
      variant: 'primary' as const,
      className: 'test-class',
      customProp: 'custom-value'
    };
    
    const result = validator.validate(props);
    
    expect(result.isValid).toBe(true);
    expect(result.sanitizedProps).toEqual(props);
  });
});

describe('validateComponentProps', () => {
  it('should validate props and return sanitized version', () => {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      count: z.number().optional()
    });
    
    const validator = new ComponentPropsValidator(schema);
    const props = {
      title: 'Valid Title',
      count: 42
    };
    
    const result = validateComponentProps(props, validator, 'TestComponent');
    
    expect(result).toEqual(props);
  });

  it('should throw error in development for invalid props', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const schema = z.object({
      title: z.string().min(1, 'Title is required')
    });
    
    const validator = new ComponentPropsValidator(schema);
    const props = { title: '' }; // Invalid data
    
    expect(() => {
      validateComponentProps(props, validator, 'TestComponent');
    }).toThrow('Component validation failed for TestComponent');
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('CommonPropSchemas', () => {
  it('should validate common HTML attributes', () => {
    const validator = new ComponentPropsValidator(
      z.object(CommonPropSchemas)
    );
    
    const props = {
      className: 'test-class',
      style: { color: 'red' },
      id: 'test-id',
      disabled: true,
      loading: false
    };
    
    const result = validator.validate(props);
    
    expect(result.isValid).toBe(true);
    expect(result.sanitizedProps).toEqual(props);
  });
});
