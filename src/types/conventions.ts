/**
 * Type system conventions and utilities for Shabra OS
 * Establishes consistent patterns for type definitions across the application
 */

import { BaseEntity, BaseDTO, BaseCreateDTO, BaseUpdateDTO } from './base';

// Naming conventions
export type EntityName = string; // PascalCase, e.g., "User", "Project"
export type DTOName = string;    // PascalCase with "DTO" suffix, e.g., "UserDTO", "ProjectDTO"
export type ServiceName = string; // PascalCase with "Service" suffix, e.g., "UserService"
export type RepositoryName = string; // PascalCase with "Repository" suffix, e.g., "UserRepository"

// Type mapping conventions
export type EntityToDTO<T extends BaseEntity> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type EntityToCreateDTO<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type EntityToUpdateDTO<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export type DTOToEntity<T extends BaseDTO> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

// Field naming conventions
export type IDField = 'id';
export type TimestampFields = 'createdAt' | 'updatedAt';
export type AuditFields = 'createdBy' | 'updatedBy' | 'deletedAt' | 'deletedBy';

// Common field patterns
export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;
}

export interface Auditable extends Timestamped {
  createdBy?: string;
  updatedBy?: string;
}

// Validation patterns
export interface ValidationRules {
  required?: string[];
  optional?: string[];
  minLength?: Record<string, number>;
  maxLength?: Record<string, number>;
  pattern?: Record<string, RegExp>;
  custom?: Record<string, (value: any) => boolean | string>;
}

// API endpoint patterns
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointConfig {
  method: HTTPMethod;
  path: string;
  entity: EntityName;
  requiresAuth: boolean;
  requiredRoles?: string[];
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// Response type patterns
export type SingleResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ListResponse<T> = {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
};

// Type transformation utilities
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type NonEmptyArray<T> = [T, ...T[]];

// Utility type for making specific fields required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Utility type for making specific fields optional
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for picking specific fields
export type PickFields<T, K extends keyof T> = Pick<T, K>;

// Utility type for omitting specific fields
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

// Utility type for extracting the type of array elements
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Utility type for extracting the return type of a function
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Utility type for extracting the parameter types of a function
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Common generic constraints
export type StringKeyOf<T> = Extract<keyof T, string>;
export type NumberKeyOf<T> = Extract<keyof T, number>;
export type SymbolKeyOf<T> = Extract<keyof T, symbol>;

// Type narrowing utilities
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isDate(value: any): value is Date {
  return value instanceof Date;
}

export function isNull(value: any): value is null {
  return value === null;
}

export function isUndefined(value: any): value is undefined {
  return value === undefined;
}

export function isNullish(value: any): value is null | undefined {
  return value === null || value === undefined;
}

// Type assertion utilities
export function assertIsString(value: any, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(value: any, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsBoolean(value: any, message?: string): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new Error(message || `Expected boolean, got ${typeof value}`);
  }
}

export function assertIsObject(value: any, message?: string): asserts value is object {
  if (!isObject(value)) {
    throw new Error(message || `Expected object, got ${typeof value}`);
  }
}

export function assertIsArray<T>(value: any, message?: string): asserts value is T[] {
  if (!isArray(value)) {
    throw new Error(message || `Expected array, got ${typeof value}`);
  }
}

export function assertIsDate(value: any, message?: string): asserts value is Date {
  if (!isDate(value)) {
    throw new Error(message || `Expected Date, got ${typeof value}`);
  }
}

// Type conversion utilities
export function toDate(value: string | Date): Date {
  if (isDate(value)) {
    return value;
  }
  if (isString(value)) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${value}`);
    }
    return date;
  }
  throw new Error(`Cannot convert ${typeof value} to Date`);
}

export function toISOString(value: Date | string): string {
  if (isString(value)) {
    return value;
  }
  if (isDate(value)) {
    return value.toISOString();
  }
  throw new Error(`Cannot convert ${typeof value} to ISO string`);
}

// Type validation utilities
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (isNullish(value)) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

export function validateString(value: any, fieldName: string, minLength?: number, maxLength?: number): string {
  assertIsString(value, `${fieldName} must be a string`);
  
  if (minLength !== undefined && value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return value;
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): number {
  assertIsNumber(value, `${fieldName} must be a number`);
  
  if (min !== undefined && value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && value > max) {
    throw new Error(`${fieldName} must be no more than ${max}`);
  }
  
  return value;
}

export function validateEmail(value: any, fieldName: string = 'email'): string {
  const email = validateString(value, fieldName);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error(`${fieldName} must be a valid email address`);
  }
  
  return email;
}

export function validateEnum<T extends string>(value: any, fieldName: string, allowedValues: readonly T[]): T {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
}
