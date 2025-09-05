# Error Exposure Implementation for Frontend Debugging

## 🚨 Problem Solved
The `[AUTH DEBUG]` logs from inside the `authorize` function were not appearing in Vercel logs, suggesting errors were occurring before the authorize function was called or failing silently within NextAuth core.

## ✅ Solution Implemented

### **Step 1: Modified `authorize` Function to Throw Errors**

Replaced the entire `authorize` function in `src/auth.ts` with a version that **throws custom errors** at every failure point instead of returning `null`:

```typescript
async authorize(credentials) {
  // 1. Log the entry point
  console.log("✅ [AUTH DEBUG] Authorize function STARTED with credentials:", credentials?.email);

  // 2. Check if credentials exist
  if (!credentials?.email || !credentials?.password) {
    console.error("❌ [AUTH DEBUG] Credentials object is missing email or password.");
    throw new Error("Debugging: Credentials object is missing email or password.");
  }

  try {
    // 3. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      console.error(`❌ [AUTH DEBUG] User with email '${credentials.email}' not found.`);
      throw new Error(`Debugging: User with email '${credentials.email}' not found in the database.`);
    }

    if (!user.password) {
      console.error(`❌ [AUTH DEBUG] User '${credentials.email}' found, but has no password.`);
      throw new Error(`Debugging: User '${credentials.email}' found, but has no password in the database.`);
    }

    // 4. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(
      credentials.password as string,
      user.password as string
    );

    if (!isPasswordCorrect) {
      console.error("❌ [AUTH DEBUG] Password comparison failed.");
      throw new Error("Debugging: Password comparison failed. The provided password is incorrect.");
    }
    
    // 5. Success
    console.log("✅ [AUTH DEBUG] Authentication successful for:", user.email);
    return user;

  } catch (error) {
    // This will catch any errors from the steps above or database connection issues and re-throw them.
    console.error("❌ [AUTH DEBUG] A critical error occurred during authorization:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(errorMessage); // Propagate the specific error message
  }
}
```

### **Step 2: Modified Login Page to Display Errors**

Updated `src/app/(auth)/login/page.tsx` to use NextAuth's `signIn` directly and capture error messages:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setError('');
  
  try {
    const result = await signIn('credentials', {
      redirect: false, // Important: Do not redirect, so we can handle the error here
      email,
      password,
    });

    if (result?.error) {
      // The error message from our authorize function will be here!
      setError(result.error);
    } else if (result?.ok) {
      window.location.href = callbackUrl;
    } else {
      setError('An unexpected error occurred during login.');
    }
  } catch (catchError) {
    setError('An unexpected error occurred during signIn call.');
  }
};
```

### **Step 3: Enhanced Test Login**

Updated the test login button to use the correct credentials (`admin@shabra.com` / `admin-password-123`) and the same error handling approach.

## 🎯 What This Achieves

### **Error Visibility:**
- **All errors are now thrown** instead of returning `null`
- **Error messages are displayed directly on the login page**
- **Specific error details** help identify the exact failure point

### **Debugging Information:**
- **Console logs** show the flow through the authorize function
- **Frontend error display** shows the exact error message
- **Test button** uses known good credentials for testing

## 🔍 Expected Error Messages

When you attempt to log in, you'll see one of these specific error messages on the login page:

1. **"Debugging: Credentials object is missing email or password."**
   - The authorize function isn't receiving credentials properly

2. **"Debugging: User with email 'admin@shabra.com' not found in the database."**
   - The user doesn't exist in the database

3. **"Debugging: User 'admin@shabra.com' found, but has no password in the database."**
   - The user exists but has no password set

4. **"Debugging: Password comparison failed. The provided password is incorrect."**
   - The password doesn't match the stored hash

5. **Database connection errors** (e.g., connection timeout, invalid URL)
   - The database is not accessible

## 🚀 Next Steps

1. **Deploy the updated code** to Vercel
2. **Go to your login page** in production
3. **Click the "🧪 Test Login (admin@shabra.com)" button**
4. **Look for the specific error message** displayed on the page
5. **Check Vercel logs** for the `[AUTH DEBUG]` messages

## 🎯 Success Criteria

- **If you see "✅ [AUTH DEBUG] Authorize function STARTED"** in Vercel logs: The authorize function is being called
- **If you see a specific error message on the login page**: We've identified the exact failure point
- **If you see "✅ [AUTH DEBUG] Authentication successful"**: The authentication is working correctly

This implementation guarantees that you will see exactly what's going wrong with the authentication process, either in the Vercel logs or directly on the login page.
