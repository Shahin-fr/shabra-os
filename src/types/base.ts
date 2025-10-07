/**
 * Base types and interfaces for the Shabra OS type system
 * Provides foundational types for entities, DTOs, and API responses
 */

// Base entity interface that all database entities should extend
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base DTO interface for data transfer objects
export interface BaseDTO {
  id: string;
  createdAt: string; // ISO string format for JSON serialization
  updatedAt: string; // ISO string format for JSON serialization
}

// Base creation DTO (excludes id and timestamps)
export interface BaseCreateDTO {
  // No id, createdAt, or updatedAt - these are generated
}

// Base update DTO (excludes id and timestamps, all fields optional)
export interface BaseUpdateDTO {
  // All fields optional for partial updates
}

// Base query parameters for list endpoints
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Base pagination response
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Base list response
export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Base API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Base error response
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
}

// Base success response
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

// Utility types for common patterns
export type EntityId = string;
export type Timestamp = Date;
export type ISOTimestamp = string;

// Common field types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Common validation patterns
export type Email = string;
export type PhoneNumber = string;
export type URL = string;
export type Slug = string;

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  uploadedAt: Date;
}

// Audit fields that can be added to entities
export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// Soft delete interface
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  deletedBy?: string;
}

// Base repository interface
export interface BaseRepository<TEntity extends BaseEntity, TCreateDTO extends BaseCreateDTO, TUpdateDTO extends BaseUpdateDTO> {
  findById(id: string): Promise<TEntity | null>;
  findMany(params?: BaseQueryParams): Promise<ListResponse<TEntity>>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(id: string, data: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy?: string): Promise<void>;
  restore(id: string): Promise<void>;
}

// Base service interface
export interface BaseService<TEntity extends BaseEntity, TCreateDTO extends BaseCreateDTO, TUpdateDTO extends BaseUpdateDTO> {
  getById(id: string): Promise<TEntity | null>;
  getList(params?: BaseQueryParams): Promise<ListResponse<TEntity>>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(id: string, data: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy?: string): Promise<void>;
  restore(id: string): Promise<void>;
}

// Type guards
export function isBaseEntity(obj: any): obj is BaseEntity {
  return obj && typeof obj.id === 'string' && obj.createdAt instanceof Date && obj.updatedAt instanceof Date;
}

export function isBaseDTO(obj: any): obj is BaseDTO {
  return obj && typeof obj.id === 'string' && typeof obj.createdAt === 'string' && typeof obj.updatedAt === 'string';
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj.success === 'boolean';
}

export function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && obj.success === false && obj.error && typeof obj.error.code === 'string';
}

export function isSuccessResponse<T>(obj: any): obj is SuccessResponse<T> {
  return obj && obj.success === true && obj.data !== undefined;
}
