import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Ensure environment variables are set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("NEXTAUTH_SECRET is not set. Please set it in your .env.local file.");
  // Use a fallback secret for development (DO NOT USE IN PRODUCTION)
  process.env.NEXTAUTH_SECRET = "your-secret-key-here-change-in-production";
}

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user with the provided email and include their roles
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            include: {
              userRoles: true,
            },
          });

          // If user is not found, return null
          if (!user) {
            return null;
          }

          // Use bcrypt to securely compare the provided password with the hashed password
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          // Extract roles from userRoles
          const roles = user.userRoles.map(userRole => userRole.role);

          // Return the user object with id, email, name, and role
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: roles,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = (NextAuth as any)(config);
