import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    // Protect all routes except login, api/auth, api/stories, api/story-types, and static files
    "/((?!login|api/auth|api/stories|api/story-types|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};

export async function middleware(request: NextRequest) {
  // Get the session token from cookies - NextAuth v5 uses different cookie names
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value ||
                      request.cookies.get('authjs.session-token')?.value ||
                      request.cookies.get('__Secure-authjs.session-token')?.value;
  
  // Also check for JWT token
  const jwtToken = request.cookies.get('next-auth.csrf-token')?.value ||
                   request.cookies.get('__Secure-next-auth.csrf-token')?.value;
  
  // Check for any NextAuth-related cookies
  const hasNextAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.includes('next-auth') || cookie.name.includes('authjs')
  );
  
  // If no session token exists and no NextAuth cookies, redirect to login
  if (!sessionToken && !jwtToken && !hasNextAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If session token exists or NextAuth cookies exist, allow the request to proceed
  return NextResponse.next();
}
