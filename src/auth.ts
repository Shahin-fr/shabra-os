// ✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration file loaded. NODE_ENV: ${process.env.NODE_ENV}
console.log("✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration file loaded. NODE_ENV:", process.env.NODE_ENV);
console.log("✅✅✅ [AUTH BOOTSTRAP] Vercel environment:", !!process.env.VERCEL);
console.log("✅✅✅ [AUTH BOOTSTRAP] Database URL set:", !!process.env.DATABASE_URL);
console.log("✅✅✅ [AUTH BOOTSTRAP] NextAuth URL set:", !!process.env.NEXTAUTH_URL);

import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';
import { initializeProductionFixes } from '@/lib/production-fixes';

// Initialize production fixes
initializeProductionFixes();

// Ensure environment variables are set (only at runtime, not during build)
// Skip validation during build time to prevent Vercel deployment issues
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  }

  if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is required');
  }
}

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
  // Add production-specific configuration
  trustHost: process.env.NODE_ENV === 'production',
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
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
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      // DEBUG: Log JWT callback (production debugging)
      console.log('🔑 [AUTH DEBUG] JWT callback triggered:', {
        hasUser: !!user,
        tokenSub: token.sub,
        hasRoles: !!user?.roles?.length,
        timestamp: new Date().toISOString()
      });

      process.stdout.write(`🔑 [AUTH DEBUG] JWT callback triggered - hasUser: ${!!user}, tokenSub: ${token.sub}\n`);

      if (user) {
        // Set the sub field to the user ID for NextAuth compatibility
        token.sub = user.id;
        token.roles = user.roles || [];
        token.avatar = user.avatar;
        token.email = user.email;
        token.name = user.name;

        console.log('🔑 [AUTH DEBUG] JWT callback: token updated successfully:', {
          userId: user.id,
          email: user.email,
          roles: user.roles,
        });

        process.stdout.write(`🔑 [AUTH DEBUG] JWT callback: token updated successfully - ${user.email}\n`);
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // DEBUG: Log session callback (production debugging)
      console.log('📋 [AUTH DEBUG] Session callback triggered:', {
        hasSessionUser: !!session.user,
        hasToken: !!token,
        tokenSub: token.sub,
        timestamp: new Date().toISOString()
      });

      process.stdout.write(`📋 [AUTH DEBUG] Session callback triggered - hasSessionUser: ${!!session.user}, tokenSub: ${token.sub}\n`);

      // Ensure session.user exists and has all required properties
      if (!session.user) {
        console.log('📋 [AUTH DEBUG] Session callback: creating session.user');
        process.stdout.write(`📋 [AUTH DEBUG] Session callback: creating session.user\n`);
        session.user = {
          id: '',
          email: '',
          name: '',
          roles: [],
        };
      }

      if (token && token.sub) {
        console.log('📋 [AUTH DEBUG] Session callback: updating session with token data:', {
          userId: token.sub,
          email: token.email,
        });

        process.stdout.write(`📋 [AUTH DEBUG] Session callback: updating session with token data - ${token.email}\n`);
        session.user.id = token.sub;
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        // Add custom properties to session
        (session.user as any).roles = token.roles || [];
        (session.user as any).avatar = token.avatar;

        console.log('📋 [AUTH DEBUG] Session callback: final session prepared:', {
          userId: session.user.id,
          email: session.user.email,
          hasRoles: !!(session.user as any).roles?.length,
        });

        process.stdout.write(`📋 [AUTH DEBUG] Session callback: final session prepared - ${session.user.email}\n`);
      } else {
        console.log('📋 [AUTH DEBUG] Session callback: no token or token.sub found');
        process.stdout.write(`📋 [AUTH DEBUG] Session callback: no token or token.sub found\n`);
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors back to login page
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let NextAuth handle domain automatically
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// ✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration completed and exported
console.log("✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration completed and exported");
process.stdout.write("✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration completed and exported\n");
