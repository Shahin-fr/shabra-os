# Production Authentication Debugging Guide

## 🚨 Issue: CredentialsSignin Error in Production

You're experiencing a `CredentialsSignin` error in production while authentication works perfectly in your local environment. This guide will help you systematically debug and fix the issue.

## 🔍 What We've Implemented

### 1. Enhanced Logging ✅
- **Added comprehensive debugging logs** in `src/auth.ts` with `[AUTH DEBUG]` prefix
- **Environment-specific logging** that shows production context
- **Database connection testing** before user lookup
- **Detailed error tracking** for each step of the authentication process

### 2. Improved Cookie Configuration ✅
- **Enhanced cookie security** for production environments
- **Proper cookie naming** with `__Secure-` and `__Host-` prefixes
- **Correct SameSite and Secure settings** for production

### 3. Production-Specific Configuration ✅
- **Added `trustHost` and `useSecureCookies`** for production
- **Environment variable validation** with Vercel-specific handling
- **Database connection testing** in the authorize function

### 4. Debugging Tools ✅
- **Created `scripts/debug-production-auth.js`** for comprehensive testing
- **Added `npm run debug:auth`** script for easy debugging

## 🚀 How to Debug the Issue

### Step 1: Check Vercel Logs

1. **Go to your Vercel dashboard**
2. **Navigate to your project → Functions tab**
3. **Look for logs with `[AUTH DEBUG]` prefix**
4. **Check for any error messages**

### Step 2: Run the Debugging Script

```bash
# Set test credentials (optional)
export TEST_USER_EMAIL="your-test-email@example.com"
export TEST_USER_PASSWORD="your-test-password"

# Run the debugging script
npm run debug:auth
```

### Step 3: Check Environment Variables

Ensure these are set in your Vercel project settings:

```bash
# Required
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production

# Optional but recommended
VERCEL=1
PRISMA_DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database
```

## 🔧 Common Issues and Solutions

### Issue 1: Database Connection Problems

**Symptoms:**
- `[AUTH DEBUG] Database connection failed` in logs
- `CredentialsSignin` error

**Solutions:**
1. **Check DATABASE_URL format:**
   ```bash
   # Correct format
   postgresql://username:password@host:port/database?schema=public
   ```

2. **Verify database is accessible:**
   ```bash
   # Test connection
   psql "postgresql://username:password@host:port/database"
   ```

3. **Check Vercel database connection:**
   - Go to Vercel dashboard → Storage → Database
   - Verify the connection string matches your environment variable

### Issue 2: Environment Variable Problems

**Symptoms:**
- `[AUTH DEBUG] Missing credentials` in logs
- Authentication fails silently

**Solutions:**
1. **Verify all required variables are set:**
   ```bash
   # Check in Vercel dashboard
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   DATABASE_URL=your-database-url
   ```

2. **Check variable names:**
   - Use `DATABASE_URL` (not `PRISMA_DATABASE_URL`)
   - Ensure `NEXTAUTH_URL` includes `https://`

### Issue 3: User Data Issues

**Symptoms:**
- `[AUTH DEBUG] User not found in database`
- `[AUTH DEBUG] User is not active`

**Solutions:**
1. **Check user exists in database:**
   ```sql
   SELECT id, email, "isActive", "firstName", "lastName" 
   FROM "User" 
   WHERE email = 'your-email@example.com';
   ```

2. **Verify user is active:**
   ```sql
   UPDATE "User" 
   SET "isActive" = true 
   WHERE email = 'your-email@example.com';
   ```

3. **Check password hash:**
   ```sql
   SELECT password FROM "User" WHERE email = 'your-email@example.com';
   ```

### Issue 4: Cookie/Session Problems

**Symptoms:**
- Authentication works but session doesn't persist
- Redirects to login page after successful authentication

**Solutions:**
1. **Check cookie settings:**
   - Ensure `secure: true` in production
   - Verify `sameSite: 'lax'`
   - Check `httpOnly: true`

2. **Verify domain settings:**
   - Don't set custom domain in production
   - Let NextAuth handle domain automatically

## 📊 Debugging Checklist

### Before Deployment:
- [ ] All environment variables set in Vercel
- [ ] Database is accessible and migrated
- [ ] User data exists and is active
- [ ] NEXTAUTH_URL matches your domain exactly

### After Deployment:
- [ ] Check Vercel function logs for `[AUTH DEBUG]` messages
- [ ] Run `npm run debug:auth` locally with production environment
- [ ] Test with a known good user account
- [ ] Verify database connection from production

### Common Log Messages to Look For:

```
✅ [AUTH DEBUG] Authorize function called with credentials
✅ [AUTH DEBUG] Database connection successful
✅ [AUTH DEBUG] User found in DB
✅ [AUTH DEBUG] Password comparison result: true
✅ [AUTH DEBUG] Authentication successful
```

```
❌ [AUTH DEBUG] Database connection failed
❌ [AUTH DEBUG] User not found in database
❌ [AUTH DEBUG] User is not active
❌ [AUTH DEBUG] Password comparison result: false
```

## 🚀 Next Steps

1. **Deploy the updated code** with enhanced logging
2. **Check Vercel logs** for `[AUTH DEBUG]` messages
3. **Run the debugging script** to test locally with production environment
4. **Share the logs** if you still see issues

## 📞 Getting Help

If you're still experiencing issues after following this guide:

1. **Share the Vercel function logs** (especially `[AUTH DEBUG]` messages)
2. **Run `npm run debug:auth`** and share the output
3. **Check your database** to ensure user data is correct
4. **Verify environment variables** in Vercel dashboard

The enhanced logging will help us identify exactly where the authentication process is failing in production.
