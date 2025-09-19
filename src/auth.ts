// NextAuth configuration

import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { initializeProductionFixes } from '@/lib/production-fixes';

// Initialize production fixes
initializeProductionFixes();

// Ensure environment variables are set (only at runtime, not during build)
// Skip validation during build time to prevent Vercel deployment issues
if (
  typeof window === 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  !process.env.VERCEL
) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  }

  if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is required');
  }
}

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  // Add production-specific configuration
  trustHost: true, // Allow localhost for development
  useSecureCookies: process.env.NODE_ENV === 'production',
  // CSRF configuration for local development
  csrfToken: {
    name: 'next-auth.csrf-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Use the standard Prisma Client
        const { prisma } = require('@/lib/prisma');

        try {
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

          if (!user || !user.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || undefined,
            roles: user.roles ? [user.roles] : ['EMPLOYEE'], // Convert string to array for compatibility
          };
        } catch (error) {
          // Authorization error occurred
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60, // 24 hours in seconds - how often to update the session
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        // Set the sub field to the user ID for NextAuth compatibility
        token.sub = user.id;
        token.roles = user.roles || [];
        token.avatar = user.avatar;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Ensure session.user exists and has all required properties
      if (!session.user) {
        session.user = {
          id: '',
          email: '',
          name: '',
          roles: [],
        };
      }

      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        // Add custom properties to session
        (session.user as any).roles = token.roles || [];
        (session.user as any).avatar = token.avatar;
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
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.callback-url'
          : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Host-next-auth.csrf-token'
          : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    pkceCodeVerifier: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.pkce.code_verifier'
          : 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60, // 15 minutes
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// NextAuth configuration completed
