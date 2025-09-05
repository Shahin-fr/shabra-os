// ✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration file loaded. NODE_ENV: ${process.env.NODE_ENV}
console.log("✅✅✅ [AUTH BOOTSTRAP] NextAuth configuration file loaded. NODE_ENV:", process.env.NODE_ENV);
console.log("✅✅✅ [AUTH BOOTSTRAP] Vercel environment:", !!process.env.VERCEL);
console.log("✅✅✅ [AUTH BOOTSTRAP] Database URL set:", !!process.env.DATABASE_URL);

// ✅ [AUTH CONFIG] Environment Variables Check
console.log("✅ [AUTH CONFIG] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("✅ [AUTH CONFIG] NEXTAUTH_SECRET is set:", !!process.env.NEXTAUTH_SECRET);
console.log("✅ [AUTH CONFIG] DATABASE_URL is set:", !!process.env.DATABASE_URL);
console.log("✅ [AUTH CONFIG] NODE_ENV:", process.env.NODE_ENV);

// import bcrypt from 'bcryptjs'; // Temporarily disabled for bypass
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

// import { prisma } from '@/lib/prisma'; // Temporarily disabled for bypass
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
  secret: process.env.NEXTAUTH_SECRET, // Make it explicit - no fallback
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
        // Log the entry point
        console.log("✅ [AUTH DEBUG] Authorize function STARTED with credentials:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH DEBUG] Missing credentials - email or password not provided');
          return null;
        }

        // 🚨 TEMPORARY BYPASS: Allow any email/password combination for testing
        console.log('🚨 [TEMP BYPASS] Allowing any credentials for testing purposes');
        
        // Create a temporary user for any valid email/password combination
        const tempUser = {
          id: 'temp-user-' + Date.now(),
          email: credentials.email as string,
          name: 'Test User',
          avatar: undefined,
          roles: ['ADMIN'], // Give admin access for testing
        };

        console.log('✅ [TEMP BYPASS] Authentication successful for testing:', {
          email: tempUser.email,
          name: tempUser.name,
          roles: tempUser.roles
        });

        return tempUser;

        // Original database authentication code (commented out for now)
        /*
        try {
          console.log('🔍 [AUTH DEBUG] Searching for user in database with email:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              roles: true,
              password: true,
              isActive: true,
            },
          });

          console.log('👤 [AUTH DEBUG] User found in DB:', {
            found: !!user,
            userId: user?.id,
            email: user?.email,
            isActive: user?.isActive,
            hasPassword: !!user?.password,
            roles: user?.roles
          });

          if (!user) {
            console.log('❌ [AUTH DEBUG] User not found in database');
            return null;
          }

          if (!user.isActive) {
            console.log('❌ [AUTH DEBUG] User authentication failed: user not active', {
              email: user.email,
              isActive: user.isActive
            });
            return null;
          }

          console.log('🔐 [AUTH DEBUG] Comparing password...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log('🔐 [AUTH DEBUG] Password comparison result:', {
            isValid: isPasswordValid,
            email: user.email
          });

          if (!isPasswordValid) {
            console.log('❌ [AUTH DEBUG] User authentication failed: invalid password', {
              email: user.email
            });
            return null;
          }

          const userToReturn = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || undefined,
            roles: user.roles || [],
          };

          console.log('✅ [AUTH DEBUG] Authentication successful, returning user:', {
            id: userToReturn.id,
            email: userToReturn.email,
            name: userToReturn.name,
            roles: userToReturn.roles
          });
          return userToReturn;
        } catch (error) {
          console.log('💥 [AUTH DEBUG] Authorization error occurred:', {
            error: error instanceof Error ? error.message : String(error),
            email: credentials.email,
            stack: error instanceof Error ? error.stack : undefined
          });
          return null;
        }
        */
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
