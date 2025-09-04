# Story Type Management API

This document describes the Story Type Management API endpoints for the Shabra OS application.

## Overview

The Story Type Management API provides CRUD operations for managing story types in the system. All endpoints require authentication and admin role access.

## Authentication

All endpoints require:

- Valid NextAuth session
- User must have "admin" role

## Endpoints

### 1. Get All Story Types

**GET** `/api/story-types`

Retrieves all story types in the system.

**Response:**

```json
[
  {
    "id": "clx1234567890",
    "name": "News",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized (no valid session)
- `403` - Forbidden (user doesn't have admin role)
- `500` - Internal server error

### 2. Create Story Type

**POST** `/api/story-types`

Creates a new story type.

**Request Body:**

```json
{
  "name": "Feature Story"
}
```

**Response:**

```json
{
  "id": "clx1234567890",
  "name": "Feature Story",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Bad request (missing or invalid name)
- `401` - Unauthorized (no valid session)
- `403` - Forbidden (user doesn't have admin role)
- `409` - Conflict (story type with this name already exists)
- `500` - Internal server error

### 3. Get Story Type by ID

**GET** `/api/story-types/[storyTypeId]`

Retrieves a specific story type by ID.

**Response:**

```json
{
  "id": "clx1234567890",
  "name": "News",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "_count": {
    "stories": 5
  }
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad request (invalid story type ID)
- `401` - Unauthorized (no valid session)
- `403` - Forbidden (user doesn't have admin role)
- `404` - Story type not found
- `500` - Internal server error

### 4. Update Story Type

**PUT** `/api/story-types/[storyTypeId]`

Updates an existing story type.

**Request Body:**

```json
{
  "name": "Updated News"
}
```

**Response:**

```json
{
  "id": "clx1234567890",
  "name": "Updated News",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**

- `200` - Updated successfully
- `400` - Bad request (missing or invalid name, invalid story type ID)
- `401` - Unauthorized (no valid session)
- `403` - Forbidden (user doesn't have admin role)
- `404` - Story type not found
- `409` - Conflict (story type with this name already exists)
- `500` - Internal server error

### 5. Delete Story Type

**DELETE** `/api/story-types/[storyTypeId]`

Deletes a story type. Only works if no stories are using this type.

**Response:**

```json
{
  "message": "Story type deleted successfully"
}
```

**Status Codes:**

- `200` - Deleted successfully
- `400` - Bad request (invalid story type ID)
- `401` - Unauthorized (no valid session)
- `403` - Forbidden (user doesn't have admin role)
- `404` - Story type not found
- `409` - Conflict (story type is being used by stories)
- `500` - Internal server error

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

## Validation Rules

- **Name**: Required, must be a non-empty string, must be unique across all story types
- **Story Type ID**: Must be a valid string identifier

## Business Rules

1. **Unique Names**: Story type names must be unique across the system
2. **Deletion Protection**: Story types cannot be deleted if they are associated with existing stories
3. **Admin Only**: All operations require admin role access
4. **Audit Trail**: All story types maintain `createdAt` and `updatedAt` timestamps

## Example Usage

### Creating a Story Type

```bash
curl -X POST /api/story-types \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"name": "Breaking News"}'
```

### Updating a Story Type

```bash
curl -X PUT /api/story-types/clx1234567890 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"name": "Breaking News Update"}'
```

### Deleting a Story Type

```bash
curl -X DELETE /api/story-types/clx1234567890 \
  -H "Cookie: next-auth.session-token=your-session-token"
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid NextAuth session
2. **Role-Based Access**: Only users with "admin" role can access these endpoints
3. **Input Validation**: All inputs are validated to prevent injection attacks
4. **Error Handling**: Sensitive information is not exposed in error messages

## Database Schema

The API works with the following Prisma model:

```prisma
model StoryType {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  stories   Story[]

  @@map("story_types")
}
```

## Future Enhancements

Potential future features:

- Bulk operations (create/update/delete multiple story types)
- Soft delete functionality
- Story type categories or hierarchies
- Story type usage analytics
- Story type templates
