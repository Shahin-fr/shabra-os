# NextAuth Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database (if not already set)
DATABASE_URL="file:./dev.db"
```

## Generate a Secure Secret

For production, generate a secure secret using:

```bash
openssl rand -base64 32
```

## Features Implemented

1. **NextAuth Integration**: Complete NextAuth setup with CredentialsProvider
2. **Session Management**: JWT-based sessions with role-based access
3. **Route Protection**: Middleware to protect all routes except login and auth endpoints
4. **Login Flow**: Updated login page using NextAuth's signIn function
5. **Session Display**: Home page shows user session information
6. **Logout Functionality**: Sign out button with redirect to login page

## How It Works

1. User enters credentials on `/login`
2. NextAuth validates credentials against the database
3. On success, user is redirected to `/` with an active session
4. All protected routes check for valid session via middleware
5. Session data is available throughout the app via `useSession` hook

## API Routes

- `/api/auth/[...nextauth]` - NextAuth API routes (handles all auth operations)
- `/api/auth/login` - Legacy login route (can be removed if not needed)

## Session Data

The session object contains:

- `user.id`: User's unique identifier
- `user.email`: User's email address
- `user.name`: User's full name (firstName + lastName)
- `user.role`: Array of user roles

## TypeScript Support

Type definitions are provided in `src/types/next-auth.d.ts` for proper TypeScript support.
