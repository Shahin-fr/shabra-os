# Environment Variables Setup Guide

## 🚨 CRITICAL: Create .env.local File

To fix your NextAuth.js login issues, you **MUST** create a `.env.local` file in your project root with the following content:

### Step 1: Create .env.local

Create a new file called `.env.local` in your project root directory (same level as `package.json`).

### Step 2: Copy and Paste This Content

```bash
# ========================================
# SHABRA-OS Environment Configuration
# ========================================
# IMPORTANT: Replace placeholder values with your actual database credentials
# NEVER commit this file to version control

# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string (REQUIRED - replace with your actual credentials)
PRISMA_DATABASE_URL="postgresql://your-username:your-password@localhost:5432/your-database-name?schema=public"

# Direct PostgreSQL connection for migrations (REQUIRED - replace with your actual credentials)
POSTGRES_URL="postgresql://your-username:your-password@localhost:5432/your-database-name?schema=public"

# ========================================
# AUTHENTICATION & SECURITY
# ========================================
# NextAuth.js secret key (REQUIRED - generated secure random string)
NEXTAUTH_SECRET="k8x#mP9$vL2@nQ7&hF4!jR5*tY6^wE3#sA8"

# NextAuth.js URL (REQUIRED - for local development)
NEXTAUTH_URL="http://localhost:3000"

# ========================================
# ENVIRONMENT CONFIGURATION
# ========================================
# Node environment
NODE_ENV="development"

# ========================================
# LOGGING CONFIGURATION
# ========================================
# Log level (debug, info, warn, error)
LOG_LEVEL="debug"

# Enable console logging (true/false)
LOG_ENABLE_CONSOLE="true"

# Remote logging endpoint
LOG_REMOTE_ENDPOINT="/api/logs"

# Log buffer size
LOG_BUFFER_SIZE="1000"

# Log flush interval (milliseconds)
LOG_BUFFER_INTERVAL="5000"

# ========================================
# SECURITY HEADERS
# ========================================
# Allowed origins for CORS (comma-separated)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# ========================================
# DEVELOPMENT SEEDING
# ========================================
# Default admin user credentials (development only)
DEV_ADMIN_EMAIL="admin@shabra.com"
DEV_ADMIN_PASSWORD="admin-password-123"

# Default regular user credentials (development only)
DEV_USER_EMAIL="user@shabra.com"
DEV_USER_PASSWORD="user-password-123"

# Default manager user credentials (development only)
DEV_MANAGER_EMAIL="manager@shabra.com"
DEV_MANAGER_PASSWORD="manager-password-123"
```

### Step 3: Replace Placeholder Values

**IMPORTANT**: You must replace these placeholder values:

1. **`your-username`** → Your PostgreSQL username
2. **`your-password`** → Your PostgreSQL password
3. **`your-database-name`** → Your actual database name

### Step 4: Verify File Location

Your `.env.local` file should be in the same directory as your `package.json` file.

### Step 5: Restart Your Development Server

After creating the `.env.local` file, restart your Next.js development server:

```bash
npm run dev
```

## 🔍 Testing Your Setup

### 1. Test Database Connection

Run the database connection test script:

```bash
npx tsx scripts/test-db-connection.ts
```

### 2. Check Console Logs

When you try to log in, check your terminal console for detailed debugging information.

### 3. Verify Environment Variables

The application will now throw clear errors if any required environment variables are missing.

## 🚨 Common Issues & Solutions

### Issue: "NEXTAUTH_SECRET environment variable is required"

**Solution**: Ensure your `.env.local` file exists and contains `NEXTAUTH_SECRET`

### Issue: "NEXTAUTH_URL environment variable is required"

**Solution**: Add `NEXTAUTH_URL="http://localhost:3000"` to your `.env.local`

### Issue: Database connection errors

**Solution**: Verify your PostgreSQL credentials and ensure the database exists

### Issue: Still getting redirected to `/api/auth/error`

**Solution**: Check your terminal console for detailed error logs from the updated auth.ts file

## 📝 Next Steps

1. ✅ Create `.env.local` file with the content above
2. ✅ Replace database credentials with your actual values
3. ✅ Restart your development server
4. ✅ Test database connection with the script
5. ✅ Try logging in and check console logs for debugging info

The updated authentication system now includes comprehensive logging that will help identify exactly where the login process is failing.
