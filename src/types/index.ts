/**
 * Main type system exports for Shabra OS
 * Provides a centralized export point for all type definitions
 */

// Base types
export * from './base';
export * from './conventions';
export * from './transformers';
export * from './validation';
export * from './api';

// Entity types
export * from './entities';
export * from './schemas';

// Re-export commonly used types for convenience
export type {
  BaseEntity,
  BaseDTO,
  BaseCreateDTO,
  BaseUpdateDTO,
  SoftDeleteEntity,
  EntityId,
  Timestamp,
  ISOTimestamp,
  Status,
  Priority,
  Email,
  PhoneNumber,
  URL,
  Slug,
} from './base';

export type {
  EntityToDTO,
  EntityToCreateDTO,
  EntityToUpdateDTO,
  DTOToEntity,
  DeepPartial,
  DeepRequired,
  NonNullable,
  NonEmptyArray,
  RequireFields,
  OptionalFields,
  PickFields,
  OmitFields,
  ArrayElement,
  ReturnType,
  Parameters,
} from './conventions';

export type {
  ApiResponse,
  ErrorResponse,
  SuccessResponse,
  SingleEntityResponse,
  EntityListResponse,
  EntityCreatedResponse,
  EntityUpdatedResponse,
  EntityDeletedResponse,
  EntityNotFoundResponse,
  ValidationErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  ConflictResponse,
  RateLimitResponse,
  InternalServerErrorResponse,
  ApiResponseType,
  CreateEntityRequest,
  UpdateEntityRequest,
  QueryParams,
} from './api';

export type {
  UserEntity,
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  WikiItemEntity,
  WikiItemDTO,
  CreateWikiItemDTO,
  UpdateWikiItemDTO,
  StoryEntity,
  StoryDTO,
  CreateStoryDTO,
  UpdateStoryDTO,
  StoryIdeaEntity,
  StoryIdeaDTO,
  CreateStoryIdeaDTO,
  UpdateStoryIdeaDTO,
  MeetingEntity,
  MeetingDTO,
  CreateMeetingDTO,
  UpdateMeetingDTO,
  ProjectEntity,
  ProjectDTO,
  CreateProjectDTO,
  UpdateProjectDTO,
  TaskEntity,
  TaskDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  AuditLogEntity,
  AuditLogDTO,
  CreateAuditLogDTO,
  UpdateAuditLogDTO,
  Entity,
  DTO,
  CreateDTO,
  UpdateDTO,
  EntityName,
  EntityTypeMap,
  DTOTypeMap,
  CreateDTOTypeMap,
  UpdateDTOTypeMap,
} from './entities';

// Re-export validation utilities
export {
  validateEntity,
  validateDTO,
  validateCreateDTO,
  validateUpdateDTO,
  safeValidateEntity,
  safeValidateDTO,
  safeValidateCreateDTO,
  safeValidateUpdateDTO,
  formatValidationErrors,
  formatValidationError,
  validateEmail,
  validatePhone,
  validateURL,
  validateSlug,
  validatePassword,
  validateName,
  createConditionalSchema,
  validateArray,
  validateNonEmptyArray,
  validatePartialObject,
  createCustomSchema,
  createTransformSchema,
  createRefinedSchema,
  createMultiRefinedSchema,
} from './validation';

// Re-export transformation utilities
export {
  entityToDTO,
  entitiesToDTOs,
  dtoToEntity,
  dtosToEntities,
  entityToCreateDTO,
  entityToUpdateDTO,
  mergeUpdateDTO,
  createPartialDTO,
  deepEntityToDTO,
  deepDtoToEntity,
  createSummaryDTO,
  createPublicDTO,
  validateCreateDTO as validateCreateDTOData,
  validateUpdateDTO as validateUpdateDTOData,
  createComputedDTO,
  transformDTO,
  createChangedDTO,
  safeTransform,
} from './transformers';

// Re-export API utilities
export {
  HTTP_STATUS,
  ApiResponseBuilder,
  isSuccessResponse,
  isErrorResponse,
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
  validateApiResponse,
  transformApiResponse,
  handleApiResponse,
  handleApiResponseAsync,
} from './api';

// Re-export type guards
export {
  isBaseEntity,
  isBaseDTO,
  isApiResponse,
  isErrorResponse as isErrorResponseType,
  isSuccessResponse as isSuccessResponseType,
} from './base';

// Re-export type checking utilities
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isNull,
  isUndefined,
  isNullish,
  assertIsString,
  assertIsNumber,
  assertIsBoolean,
  assertIsObject,
  assertIsArray,
  assertIsDate,
  toDate,
  toISOString,
  validateRequired,
  validateString,
  validateNumber,
  validateEmail as validateEmailField,
  validateEnum,
} from './conventions';

// Re-export schemas
export {
  EntitySchemas,
  DTOSchemas,
  CreateDTOSchemas,
  UpdateDTOSchemas,
} from './schemas';
