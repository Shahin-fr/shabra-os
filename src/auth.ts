import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { logAuth, logUser, logError } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

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

          if (!user) {
            return null;
          }

          if (!user.isActive) {
            logUser('User authentication failed: user not active', {
              email: user.email,
            });
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            logUser('User authentication failed: invalid password', {
              email: user.email,
            });
            return null;
          }

          logUser('User authenticated successfully', {
            email: user.email,
            userId: user.id,
          });
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || undefined,
            roles: user.roles || [],
          };
        } catch (error) {
          logError(
            'Authorization error occurred',
            error instanceof Error ? error : new Error(String(error)),
            {
              email: credentials.email,
              operation: 'authorize',
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            }
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      logAuth('JWT callback triggered', {
        hasUser: !!user,
        tokenSub: token.sub,
        hasRoles: !!user?.roles?.length,
      });

      if (user) {
        // Set the sub field to the user ID for NextAuth compatibility
        token.sub = user.id;
        token.roles = user.roles || [];
        token.avatar = user.avatar;
        token.email = user.email;
        token.name = user.name;

        logAuth('JWT callback: token updated successfully', {
          userId: user.id,
          email: user.email,
          roles: user.roles,
        });
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      logAuth('Session callback triggered', {
        hasSessionUser: !!session.user,
        hasToken: !!token,
        tokenSub: token.sub,
      });

      // Ensure session.user exists and has all required properties
      if (!session.user) {
        logAuth('Session callback: creating session.user');
        session.user = {
          id: '',
          email: '',
          name: '',
          roles: [],
        };
      }

      if (token && token.sub) {
        logAuth('Session callback: updating session with token data', {
          userId: token.sub,
          email: token.email,
        });
        session.user.id = token.sub;
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        // Add custom properties to session
        (session.user as any).roles = token.roles || [];
        (session.user as any).avatar = token.avatar;

        logAuth('Session callback: final session prepared', {
          userId: session.user.id,
          email: session.user.email,
          hasRoles: !!(session.user as any).roles?.length,
        });
      } else {
        logAuth('Session callback: no token or token.sub found');
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors back to login page
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
