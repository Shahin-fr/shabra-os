/**
 * Comprehensive tests for the Shabra OS type system
 * Tests all type definitions, transformations, and validations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import {
  // Base types
  BaseEntity,
  BaseDTO,
  BaseCreateDTO,
  BaseUpdateDTO,
  isBaseEntity,
  isBaseDTO,
  isApiResponse,
  isErrorResponse,
  isSuccessResponse,
  
  // Entity types
  UserEntity,
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  WikiItemEntity,
  WikiItemDTO,
  CreateWikiItemDTO,
  UpdateWikiItemDTO,
  
  // Validation
  validateEntity,
  validateDTO,
  validateCreateDTO,
  validateUpdateDTO,
  safeValidateEntity,
  safeValidateDTO,
  safeValidateCreateDTO,
  safeValidateUpdateDTO,
  
  // Transformations
  entityToDTO,
  entitiesToDTOs,
  dtoToEntity,
  dtosToEntities,
  entityToCreateDTO,
  entityToUpdateDTO,
  deepEntityToDTO,
  deepDtoToEntity,
  createSummaryDTO,
  createPublicDTO,
  
  // API responses
  ApiResponseBuilder,
  isSingleEntityResponse,
  isEntityListResponse,
  isEntityCreatedResponse,
  isEntityUpdatedResponse,
  isEntityDeletedResponse,
  isEntityNotFoundResponse,
  isValidationErrorResponse,
  isUnauthorizedResponse,
  isForbiddenResponse,
  isConflictResponse,
  isRateLimitResponse,
  isInternalServerErrorResponse,
  
  // Schemas
  EntitySchemas,
  DTOSchemas,
  CreateDTOSchemas,
  UpdateDTOSchemas,
  
  // Type checking
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDate,
  isNull,
  isUndefined,
  isNullish,
  toDate,
  toISOString,
  validateRequired,
  validateString,
  validateNumber,
  validateEmail,
  validateEnum,
} from '@/types';

describe('Base Types', () => {
  describe('BaseEntity', () => {
    it('should create a valid BaseEntity', () => {
      const entity: BaseEntity = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.id).toBe('test-id');
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate BaseEntity with type guard', () => {
      const validEntity = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invalidEntity = {
        id: 'test-id',
        createdAt: 'not-a-date',
        updatedAt: new Date(),
      };

      expect(isBaseEntity(validEntity)).toBe(true);
      expect(isBaseEntity(invalidEntity)).toBe(false);
    });
  });

  describe('BaseDTO', () => {
    it('should create a valid BaseDTO', () => {
      const dto: BaseDTO = {
        id: 'test-id',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      expect(dto.id).toBe('test-id');
      expect(dto.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should validate BaseDTO with type guard', () => {
      const validDTO = {
        id: 'test-id',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const invalidDTO = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      expect(isBaseDTO(validDTO)).toBe(true);
      expect(isBaseDTO(invalidDTO)).toBe(false);
    });
  });
});

describe('Entity Types', () => {
  describe('UserEntity', () => {
    it('should create a valid UserEntity', () => {
      const user: UserEntity = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.roles).toBe('ADMIN');
      expect(user.isActive).toBe(true);
    });
  });

  describe('WikiItemEntity', () => {
    it('should create a valid WikiItemEntity', () => {
      const wikiItem: WikiItemEntity = {
        id: 'wiki-123',
        title: 'Test Document',
        type: 'DOCUMENT',
        parentId: null,
        content: 'Test content',
        authorId: 'user-123',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(wikiItem.title).toBe('Test Document');
      expect(wikiItem.type).toBe('DOCUMENT');
      expect(wikiItem.parentId).toBeNull();
      expect(wikiItem.content).toBe('Test content');
      expect(wikiItem.authorId).toBe('user-123');
      expect(wikiItem.isPublic).toBe(true);
    });
  });
});

describe('Validation', () => {
  describe('Entity Validation', () => {
    it('should validate a valid UserEntity', () => {
      const user = {
        id: 'clh1234567890123456789012',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validatedUser = validateEntity(user, EntitySchemas.User);
      expect(validatedUser).toEqual(user);
    });

    it('should throw error for invalid UserEntity', () => {
      const invalidUser = {
        id: 'user-123',
        firstName: '', // Invalid: empty string
        lastName: 'Doe',
        email: 'invalid-email', // Invalid: not an email
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => validateEntity(invalidUser, EntitySchemas.User)).toThrow();
    });
  });

  describe('DTO Validation', () => {
    it('should validate a valid UserDTO', () => {
      const userDTO = {
        id: 'clh1234567890123456789012',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const validatedDTO = validateDTO(userDTO, DTOSchemas.User);
      expect(validatedDTO).toEqual(userDTO);
    });

    it('should throw error for invalid UserDTO', () => {
      const invalidDTO = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        roles: 'ADMIN',
        isActive: true,
        createdAt: 'invalid-date',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      expect(() => validateDTO(invalidDTO, DTOSchemas.User)).toThrow();
    });
  });

  describe('Create DTO Validation', () => {
    it('should validate a valid CreateUserDTO', () => {
      const createUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roles: 'ADMIN',
        isActive: true,
      };

      const validatedDTO = validateCreateDTO(createUserDTO, CreateDTOSchemas.User);
      expect(validatedDTO).toEqual(createUserDTO);
    });

    it('should throw error for invalid CreateUserDTO', () => {
      const invalidDTO = {
        firstName: '', // Invalid: empty string
        lastName: 'Doe',
        email: 'invalid-email',
        roles: 'ADMIN',
      };

      expect(() => validateCreateDTO(invalidDTO, CreateDTOSchemas.User)).toThrow();
    });
  });

  describe('Safe Validation', () => {
    it('should return success for valid data', () => {
      const user = {
        id: 'clh1234567890123456789012',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = safeValidateEntity(user, EntitySchemas.User);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(user);
      }
    });

    it('should return error for invalid data', () => {
      const invalidUser = {
        id: 'user-123',
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = safeValidateEntity(invalidUser, EntitySchemas.User);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeInstanceOf(z.ZodError);
      }
    });
  });
});

describe('Transformations', () => {
  describe('Entity to DTO', () => {
    it('should transform UserEntity to UserDTO', () => {
      const user: UserEntity = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      };

      const userDTO = entityToDTO(user);

      expect(userDTO.id).toBe(user.id);
      expect(userDTO.firstName).toBe(user.firstName);
      expect(userDTO.lastName).toBe(user.lastName);
      expect(userDTO.email).toBe(user.email);
      expect(userDTO.roles).toBe(user.roles);
      expect(userDTO.isActive).toBe(user.isActive);
      expect(userDTO.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(userDTO.updatedAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should transform multiple entities to DTOs', () => {
      const users: UserEntity[] = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          roles: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          roles: 'USER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const userDTOs = entitiesToDTOs(users);

      expect(userDTOs).toHaveLength(2);
      expect(userDTOs[0].firstName).toBe('John');
      expect(userDTOs[1].firstName).toBe('Jane');
    });
  });

  describe('DTO to Entity', () => {
    it('should transform UserDTO to UserEntity', () => {
      const userDTO: UserDTO = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const user = dtoToEntity(userDTO);

      expect(user.id).toBe(userDTO.id);
      expect(user.firstName).toBe(userDTO.firstName);
      expect(user.lastName).toBe(userDTO.lastName);
      expect(user.email).toBe(userDTO.email);
      expect(user.roles).toBe(userDTO.roles);
      expect(user.isActive).toBe(userDTO.isActive);
      expect(user.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
      expect(user.updatedAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });
  });

  describe('Deep Transformations', () => {
    it('should transform nested entities to DTOs', () => {
      const wikiItem: WikiItemEntity = {
        id: 'wiki-123',
        title: 'Test Document',
        type: 'DOCUMENT',
        parentId: null,
        content: 'Test content',
        authorId: 'user-123',
        author: {
          id: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          roles: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const wikiItemDTO = deepEntityToDTO(wikiItem);

      expect(wikiItemDTO.id).toBe(wikiItem.id);
      expect(wikiItemDTO.title).toBe(wikiItem.title);
      expect(wikiItemDTO.author).toBeDefined();
      expect(wikiItemDTO.author?.firstName).toBe('John');
      expect(wikiItemDTO.author?.createdAt).toBe(wikiItem.author?.createdAt.toISOString());
    });
  });

  describe('Summary DTO', () => {
    it('should create a summary DTO with only specified fields', () => {
      const user: UserEntity = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const summaryDTO = createSummaryDTO(user, ['id', 'firstName', 'lastName', 'email']);

      expect(summaryDTO.id).toBe(user.id);
      expect(summaryDTO.firstName).toBe(user.firstName);
      expect(summaryDTO.lastName).toBe(user.lastName);
      expect(summaryDTO.email).toBe(user.email);
      expect(summaryDTO.roles).toBeUndefined();
      expect(summaryDTO.isActive).toBeUndefined();
    });
  });

  describe('Public DTO', () => {
    it('should create a public DTO by excluding sensitive fields', () => {
      const user: UserEntity = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const publicDTO = createPublicDTO(user, ['email', 'roles']);

      expect(publicDTO.id).toBe(user.id);
      expect(publicDTO.firstName).toBe(user.firstName);
      expect(publicDTO.lastName).toBe(user.lastName);
      expect(publicDTO.email).toBeUndefined();
      expect(publicDTO.roles).toBeUndefined();
      expect(publicDTO.isActive).toBe(user.isActive);
    });
  });
});

describe('API Responses', () => {
  describe('ApiResponseBuilder', () => {
    it('should create a success response', () => {
      const data = { id: 'test', name: 'Test' };
      const response = ApiResponseBuilder.success(data, 'Success message');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success message');
    });

    it('should create a created response', () => {
      const data = { id: 'test', name: 'Test' };
      const response = ApiResponseBuilder.created(data, 'Created successfully');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Created successfully');
      expect(response.status).toBe(201);
    });

    it('should create an error response', () => {
      const response = ApiResponseBuilder.notFound('User', 'user-123');

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('ENTITY_NOT_FOUND');
      expect(response.error.message).toBe('User with id user-123 not found');
    });

    it('should create a validation error response', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const response = ApiResponseBuilder.validationError(errors);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.details).toEqual(errors);
    });
  });

  describe('Type Guards', () => {
    it('should identify success responses', () => {
      const successResponse = ApiResponseBuilder.success({ id: 'test' });
      const errorResponse = ApiResponseBuilder.notFound('User', 'test');

      expect(isSuccessResponse(successResponse)).toBe(true);
      expect(isSuccessResponse(errorResponse)).toBe(false);
    });

    it('should identify error responses', () => {
      const successResponse = ApiResponseBuilder.success({ id: 'test' });
      const errorResponse = ApiResponseBuilder.notFound('User', 'test');

      expect(isErrorResponse(successResponse)).toBe(false);
      expect(isErrorResponse(errorResponse)).toBe(true);
    });

    it('should identify specific response types', () => {
      const createdResponse = ApiResponseBuilder.created({ id: 'test' });
      const notFoundResponse = ApiResponseBuilder.notFound('User', 'test');
      const validationResponse = ApiResponseBuilder.validationError([]);

      expect(isEntityCreatedResponse(createdResponse)).toBe(true);
      expect(isEntityNotFoundResponse(notFoundResponse)).toBe(true);
      expect(isValidationErrorResponse(validationResponse)).toBe(true);
    });
  });
});

describe('Type Checking Utilities', () => {
  describe('Basic Type Guards', () => {
    it('should identify strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });

    it('should identify numbers', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(Infinity)).toBe(true);
    });

    it('should identify booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(1)).toBe(false);
    });

    it('should identify objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    it('should identify arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
    });

    it('should identify dates', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate(undefined)).toBe(false);
    });

    it('should identify null and undefined', () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isNullish(null)).toBe(true);
      expect(isNullish(undefined)).toBe(true);
      expect(isNullish(0)).toBe(false);
    });
  });

  describe('Type Conversion', () => {
    it('should convert string to date', () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const date = toDate(dateString);

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe(dateString);
    });

    it('should convert date to ISO string', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const isoString = toISOString(date);

      expect(isoString).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle string ISO strings', () => {
      const isoString = '2023-01-01T00:00:00.000Z';
      const result = toISOString(isoString);

      expect(result).toBe(isoString);
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const value = 'test';
      const result = validateRequired(value, 'testField');

      expect(result).toBe('test');
    });

    it('should throw error for null/undefined required fields', () => {
      expect(() => validateRequired(null, 'testField')).toThrow('testField is required');
      expect(() => validateRequired(undefined, 'testField')).toThrow('testField is required');
    });

    it('should validate string fields', () => {
      const result = validateString('hello', 'testField', 3, 10);

      expect(result).toBe('hello');
    });

    it('should throw error for invalid string fields', () => {
      expect(() => validateString(123, 'testField')).toThrow('testField must be a string');
      expect(() => validateString('hi', 'testField', 3)).toThrow('testField must be at least 3 characters long');
      expect(() => validateString('hello world', 'testField', 3, 5)).toThrow('testField must be no more than 5 characters long');
    });

    it('should validate number fields', () => {
      const result = validateNumber(5, 'testField', 1, 10);

      expect(result).toBe(5);
    });

    it('should throw error for invalid number fields', () => {
      expect(() => validateNumber('5', 'testField')).toThrow('testField must be a number');
      expect(() => validateNumber(0, 'testField', 1)).toThrow('testField must be at least 1');
      expect(() => validateNumber(15, 'testField', 1, 10)).toThrow('testField must be no more than 10');
    });

    it('should validate email fields', () => {
      const result = validateEmail('test@example.com');

      expect(result).toBe('test@example.com');
    });

    it('should throw error for invalid email fields', () => {
      expect(() => validateEmail('invalid-email')).toThrow('Invalid email format');
    });

    it('should validate enum fields', () => {
      const result = validateEnum('ADMIN', 'role', ['ADMIN', 'USER', 'GUEST']);

      expect(result).toBe('ADMIN');
    });

    it('should throw error for invalid enum fields', () => {
      expect(() => validateEnum('INVALID', 'role', ['ADMIN', 'USER', 'GUEST'])).toThrow('role must be one of: ADMIN, USER, GUEST');
    });
  });
});

describe('Schema Registry', () => {
  it('should have schemas for all entities', () => {
    expect(EntitySchemas.User).toBeDefined();
    expect(EntitySchemas.WikiItem).toBeDefined();
    expect(EntitySchemas.Story).toBeDefined();
    expect(EntitySchemas.StoryIdea).toBeDefined();
    expect(EntitySchemas.Meeting).toBeDefined();
    expect(EntitySchemas.Project).toBeDefined();
    expect(EntitySchemas.Task).toBeDefined();
    expect(EntitySchemas.AuditLog).toBeDefined();
  });

  it('should have DTO schemas for all entities', () => {
    expect(DTOSchemas.User).toBeDefined();
    expect(DTOSchemas.WikiItem).toBeDefined();
    expect(DTOSchemas.Story).toBeDefined();
    expect(DTOSchemas.StoryIdea).toBeDefined();
    expect(DTOSchemas.Meeting).toBeDefined();
    expect(DTOSchemas.Project).toBeDefined();
    expect(DTOSchemas.Task).toBeDefined();
    expect(DTOSchemas.AuditLog).toBeDefined();
  });

  it('should have create DTO schemas for all entities', () => {
    expect(CreateDTOSchemas.User).toBeDefined();
    expect(CreateDTOSchemas.WikiItem).toBeDefined();
    expect(CreateDTOSchemas.Story).toBeDefined();
    expect(CreateDTOSchemas.StoryIdea).toBeDefined();
    expect(CreateDTOSchemas.Meeting).toBeDefined();
    expect(CreateDTOSchemas.Project).toBeDefined();
    expect(CreateDTOSchemas.Task).toBeDefined();
    expect(CreateDTOSchemas.AuditLog).toBeDefined();
  });

  it('should have update DTO schemas for all entities', () => {
    expect(UpdateDTOSchemas.User).toBeDefined();
    expect(UpdateDTOSchemas.WikiItem).toBeDefined();
    expect(UpdateDTOSchemas.Story).toBeDefined();
    expect(UpdateDTOSchemas.StoryIdea).toBeDefined();
    expect(UpdateDTOSchemas.Meeting).toBeDefined();
    expect(UpdateDTOSchemas.Project).toBeDefined();
    expect(UpdateDTOSchemas.Task).toBeDefined();
    expect(UpdateDTOSchemas.AuditLog).toBeDefined();
  });
});
