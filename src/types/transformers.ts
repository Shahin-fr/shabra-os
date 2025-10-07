/**
 * DTO transformation utilities for Shabra OS
 * Provides type-safe conversion between entities and DTOs
 */

import { BaseEntity, BaseDTO, BaseCreateDTO, BaseUpdateDTO } from './base';
import { EntityToDTO, EntityToCreateDTO, EntityToUpdateDTO, DTOToEntity } from './conventions';

/**
 * Transform an entity to a DTO
 * Converts Date objects to ISO strings for JSON serialization
 */
export function entityToDTO<T extends BaseEntity>(entity: T): EntityToDTO<T> {
  return {
    ...entity,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  } as EntityToDTO<T>;
}

/**
 * Transform multiple entities to DTOs
 */
export function entitiesToDTOs<T extends BaseEntity>(entities: T[]): EntityToDTO<T>[] {
  return entities.map(entityToDTO);
}

/**
 * Transform a DTO to an entity
 * Converts ISO strings back to Date objects
 */
export function dtoToEntity<T extends BaseDTO>(dto: T): DTOToEntity<T> {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  } as DTOToEntity<T>;
}

/**
 * Transform multiple DTOs to entities
 */
export function dtosToEntities<T extends BaseDTO>(dtos: T[]): DTOToEntity<T>[] {
  return dtos.map(dtoToEntity);
}

/**
 * Create a create DTO from an entity (excluding id and timestamps)
 */
export function entityToCreateDTO<T extends BaseEntity>(entity: T): EntityToCreateDTO<T> {
  const { id, createdAt, updatedAt, ...createData } = entity;
  return createData as EntityToCreateDTO<T>;
}

/**
 * Create an update DTO from an entity (excluding id and timestamps, making all fields optional)
 */
export function entityToUpdateDTO<T extends BaseEntity>(entity: T): EntityToUpdateDTO<T> {
  const { id, createdAt, updatedAt, ...updateData } = entity;
  return updateData as EntityToUpdateDTO<T>;
}

/**
 * Merge update DTO with existing entity data
 * Only updates fields that are provided in the update DTO
 */
export function mergeUpdateDTO<T extends BaseEntity>(
  entity: T,
  updateDTO: Partial<EntityToUpdateDTO<T>>
): Partial<T> {
  const result: Partial<T> = { ...entity };
  
  for (const [key, value] of Object.entries(updateDTO)) {
    if (value !== undefined) {
      (result as any)[key] = value;
    }
  }
  
  return result;
}

/**
 * Create a partial DTO from an entity with only specified fields
 */
export function createPartialDTO<T extends BaseEntity, K extends keyof T>(
  entity: T,
  fields: K[]
): Pick<EntityToDTO<T>, K> {
  const result = {} as Pick<EntityToDTO<T>, K>;
  
  for (const field of fields) {
    if (field === 'createdAt' || field === 'updatedAt') {
      (result as any)[field] = entity[field].toISOString();
    } else {
      (result as any)[field] = entity[field];
    }
  }
  
  return result;
}

/**
 * Transform nested entities to DTOs recursively
 * Handles nested objects and arrays of entities
 */
export function deepEntityToDTO<T extends BaseEntity>(entity: T): EntityToDTO<T> {
  const dto = entityToDTO(entity);
  
  // Recursively transform nested entities
  for (const [key, value] of Object.entries(dto)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        // Handle arrays of entities
        (dto as any)[key] = value.map(item => 
          item && typeof item === 'object' && 'id' in item && 'createdAt' in item && 'updatedAt' in item
            ? deepEntityToDTO(item as BaseEntity)
            : item
        );
      } else if ('id' in value && 'createdAt' in value && 'updatedAt' in value) {
        // Handle single nested entity
        (dto as any)[key] = deepEntityToDTO(value as BaseEntity);
      }
    }
  }
  
  return dto;
}

/**
 * Transform nested DTOs to entities recursively
 * Handles nested objects and arrays of DTOs
 */
export function deepDtoToEntity<T extends BaseDTO>(dto: T): DTOToEntity<T> {
  const entity = dtoToEntity(dto);
  
  // Recursively transform nested DTOs
  for (const [key, value] of Object.entries(entity)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        // Handle arrays of DTOs
        (entity as any)[key] = value.map(item => 
          item && typeof item === 'object' && 'id' in item && 'createdAt' in item && 'updatedAt' in item
            ? deepDtoToEntity(item as BaseDTO)
            : item
        );
      } else if ('id' in value && 'createdAt' in value && 'updatedAt' in value) {
        // Handle single nested DTO
        (entity as any)[key] = deepDtoToEntity(value as BaseDTO);
      }
    }
  }
  
  return entity;
}

/**
 * Create a summary DTO with only essential fields
 * Useful for list views and dropdowns
 */
export function createSummaryDTO<T extends BaseEntity>(
  entity: T,
  summaryFields: (keyof T)[]
): Partial<EntityToDTO<T>> {
  const summary: Partial<EntityToDTO<T>> = {};
  
  for (const field of summaryFields) {
    if (field === 'createdAt' || field === 'updatedAt') {
      (summary as any)[field] = entity[field].toISOString();
    } else {
      (summary as any)[field] = entity[field];
    }
  }
  
  return summary;
}

/**
 * Create a public DTO by excluding sensitive fields
 * Useful for public APIs where some fields should not be exposed
 */
export function createPublicDTO<T extends BaseEntity>(
  entity: T,
  sensitiveFields: (keyof T)[]
): EntityToDTO<T> {
  const dto = entityToDTO(entity);
  
  for (const field of sensitiveFields) {
    delete (dto as any)[field];
  }
  
  return dto;
}

/**
 * Validate that a DTO has all required fields for creation
 */
export function validateCreateDTO<T extends BaseCreateDTO>(
  dto: Partial<T>,
  requiredFields: (keyof T)[]
): T {
  const missingFields: (keyof T)[] = [];
  
  for (const field of requiredFields) {
    if (dto[field] === undefined || dto[field] === null) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return dto as T;
}

/**
 * Validate that an update DTO has at least one field to update
 */
export function validateUpdateDTO<T extends BaseUpdateDTO>(
  dto: Partial<T>
): T {
  const hasFields = Object.values(dto).some(value => value !== undefined && value !== null);
  
  if (!hasFields) {
    throw new Error('At least one field must be provided for update');
  }
  
  return dto as T;
}

/**
 * Create a DTO with computed fields
 * Useful for adding calculated properties to DTOs
 */
export function createComputedDTO<T extends BaseEntity, C extends Record<string, any>>(
  entity: T,
  computedFields: (entity: T) => C
): EntityToDTO<T> & C {
  const dto = entityToDTO(entity);
  const computed = computedFields(entity);
  
  return {
    ...dto,
    ...computed,
  };
}

/**
 * Transform a DTO to a different DTO type
 * Useful for converting between different DTO representations
 */
export function transformDTO<T extends BaseDTO, U extends BaseDTO>(
  dto: T,
  transformer: (dto: T) => U
): U {
  return transformer(dto);
}

/**
 * Create a DTO with only changed fields
 * Useful for partial updates and change tracking
 */
export function createChangedDTO<T extends BaseEntity>(
  original: T,
  updated: Partial<T>
): Partial<EntityToUpdateDTO<T>> {
  const changes: Partial<EntityToUpdateDTO<T>> = {};
  
  for (const [key, value] of Object.entries(updated)) {
    if (value !== undefined && value !== (original as any)[key]) {
      (changes as any)[key] = value;
    }
  }
  
  return changes;
}

/**
 * Type-safe DTO transformation with validation
 */
export function safeTransform<T extends BaseEntity, U extends BaseDTO>(
  entity: T,
  transformer: (entity: T) => U,
  validator?: (dto: U) => boolean
): U {
  const dto = transformer(entity);
  
  if (validator && !validator(dto)) {
    throw new Error('DTO validation failed');
  }
  
  return dto;
}
