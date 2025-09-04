import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      roles: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    roles: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: string[];
    avatar?: string;
  }
}
