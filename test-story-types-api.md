# Testing the Story Types API

This guide shows how to test the newly created Story Types Management API.

## Prerequisites

1. **Development server running**: `npm run dev` (should be running on http://localhost:3000)
2. **Database seeded**: Make sure you have the admin user created with role "admin"
3. **Authentication**: You need to be logged in as an admin user

## Test Steps

### 1. Login as Admin User

First, you need to authenticate as an admin user:

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@shabra.com`
   - Password: `password123`
3. This will give you an admin session

### 2. Test API Endpoints

#### Test GET /api/story-types (Unauthenticated)

```bash
# This should return 401 Unauthorized
curl -X GET http://localhost:3000/api/story-types
```

Expected response:
```json
{
  "error": "Unauthorized"
}
```

#### Test GET /api/story-types (Authenticated as Admin)

```bash
# This should work if you're authenticated as admin
# You'll need to include your session cookie
curl -X GET http://localhost:3000/api/story-types \
  -H "Cookie: next-auth.session-token=your-session-token"
```

Expected response (if no story types exist):
```json
[]
```

#### Test POST /api/story-types (Create Story Type)

```bash
# Create a new story type
curl -X POST http://localhost:3000/api/story-types \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"name": "News"}'
```

Expected response:
```json
{
  "id": "clx...",
  "name": "News",
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

#### Test POST /api/story-types (Duplicate Name)

```bash
# Try to create another story type with the same name
curl -X POST http://localhost:3000/api/story-types \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"name": "News"}'
```

Expected response:
```json
{
  "error": "Story type with this name already exists"
}
```

#### Test GET /api/story-types (After Creation)

```bash
# Fetch all story types again
curl -X GET http://localhost:3000/api/story-types \
  -H "Cookie: next-auth.session-token=your-session-token"
```

Expected response:
```json
[
  {
    "id": "clx...",
    "name": "News",
    "createdAt": "2024-...",
    "updatedAt": "2024-..."
  }
]
```

#### Test PUT /api/story-types/[id] (Update)

```bash
# Update the story type (replace [id] with actual ID)
curl -X PUT http://localhost:3000/api/story-types/[id] \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"name": "Breaking News"}'
```

Expected response:
```json
{
  "id": "clx...",
  "name": "Breaking News",
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

#### Test DELETE /api/story-types/[id] (Delete)

```bash
# Delete the story type (replace [id] with actual ID)
curl -X DELETE http://localhost:3000/api/story-types/[id] \
  -H "Cookie: next-auth.session-token=your-session-token"
```

Expected response:
```json
{
  "message": "Story type deleted successfully"
}
```

## Testing with Browser Developer Tools

You can also test the API using your browser's developer tools:

1. **Login to the app** as admin user
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Test the API**:

```javascript
// Test GET
fetch('/api/story-types')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Test POST
fetch('/api/story-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test Story Type' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Expected Behavior

### Success Cases:
- ✅ Admin users can create, read, update, and delete story types
- ✅ Story type names are unique
- ✅ Proper validation of input data
- ✅ Appropriate HTTP status codes

### Error Cases:
- ❌ Unauthenticated users get 401
- ❌ Non-admin users get 403
- ❌ Invalid input gets 400
- ❌ Duplicate names get 409
- ❌ Non-existent IDs get 404

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Make sure you're logged in
2. **403 Forbidden**: Make sure you have admin role
3. **500 Internal Server Error**: Check server logs for details
4. **Database connection issues**: Ensure Prisma is properly configured

### Check Server Logs:

Look at the terminal where you ran `npm run dev` for any error messages or logs.

## Next Steps

After testing the API:

1. **Frontend Integration**: Create UI components to manage story types
2. **Story Type Selection**: Add story type selection to story creation forms
3. **Story Type Display**: Show story types in story lists and details
4. **Bulk Operations**: Consider adding bulk create/update/delete operations
