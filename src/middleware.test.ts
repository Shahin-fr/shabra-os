import { NextRequest, NextResponse } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { middleware } from './middleware';

// Mock Next.js server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ next: true })),
    redirect: vi.fn((url: string) => ({ redirect: true, url })),
  },
}));

describe('Authentication Middleware', () => {
  let mockRequest: NextRequest;
  let mockUrl: URL;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock URL
    mockUrl = new URL('http://localhost:3000/dashboard');

    // Create a mock request with cookies
    mockRequest = {
      url: mockUrl.toString(),
      cookies: {
        get: vi.fn(),
        getAll: vi.fn(),
      },
    } as any;
  });

  it('allows access when session token exists', async () => {
    // Mock session token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce({ value: 'valid-session-token' }) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth.session-token', value: 'valid-session-token' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access when JWT token exists', async () => {
    // Mock JWT token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce({ value: 'valid-jwt-token' }) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth.csrf-token', value: 'valid-jwt-token' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access when NextAuth cookies exist', async () => {
    // Mock NextAuth cookies
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth.callback-url', value: 'http://localhost:3000' },
      { name: 'authjs.callback-url', value: 'http://localhost:3000' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('redirects to login when no authentication cookies exist', async () => {
    // Mock no cookies
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([]);

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/login', mockUrl)
    );
    expect(NextResponse.next).not.toHaveBeenCalled();
    expect(result).toEqual({ redirect: true, url: expect.any(URL) });
    expect(result.url.toString()).toBe('http://localhost:3000/login');
  });

  it('handles secure cookie variants correctly', async () => {
    // Mock secure session token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce({ value: 'secure-session-token' }) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      {
        name: '__Secure-next-auth.session-token',
        value: 'secure-session-token',
      },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles authjs cookie variants correctly', async () => {
    // Mock authjs session token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce({ value: 'authjs-session-token' }) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'authjs.session-token', value: 'authjs-session-token' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles secure authjs cookie variants correctly', async () => {
    // Mock secure authjs session token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce({ value: 'secure-authjs-session-token' }) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      {
        name: '__Secure-authjs.session-token',
        value: 'secure-authjs-session-token',
      },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles secure JWT token cookie variants correctly', async () => {
    // Mock secure JWT token cookie
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce({ value: 'secure-jwt-token' }); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: '__Secure-next-auth.csrf-token', value: 'secure-jwt-token' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles mixed cookie scenarios correctly', async () => {
    // Mock mixed cookie scenario
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth.callback-url', value: 'http://localhost:3000' },
      { name: 'some-other-cookie', value: 'value' },
    ]);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles edge case with empty cookie values', async () => {
    // Mock empty cookie values
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce({ value: '' }) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth.session-token', value: '' },
    ]);

    const result = await middleware(mockRequest);

    // Empty values should still be considered as existing cookies
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles malformed cookie scenarios gracefully', async () => {
    // Mock malformed cookies
    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([
      { name: 'next-auth', value: 'malformed' },
      { name: 'authjs', value: 'malformed' },
    ]);

    const result = await middleware(mockRequest);

    // Should still allow access due to partial matches
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles different URL schemes correctly', async () => {
    // Test with HTTPS URL
    const httpsUrl = new URL('https://example.com/dashboard');
    Object.defineProperty(mockRequest, 'url', {
      value: httpsUrl.toString(),
      writable: true,
    });

    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([]);

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/login', httpsUrl)
    );
    expect(result).toEqual({ redirect: true, url: expect.any(URL) });
    expect(result.url.toString()).toBe('https://example.com/login');
  });

  it('handles subdomain scenarios correctly', async () => {
    // Test with subdomain URL
    const subdomainUrl = new URL('https://app.example.com/dashboard');
    Object.defineProperty(mockRequest, 'url', {
      value: subdomainUrl.toString(),
      writable: true,
    });

    (mockRequest.cookies.get as any)
      .mockReturnValueOnce(undefined) // next-auth.session-token
      .mockReturnValueOnce(undefined) // __Secure-next-auth.session-token
      .mockReturnValueOnce(undefined) // authjs.session-token
      .mockReturnValueOnce(undefined) // __Secure-authjs.session-token
      .mockReturnValueOnce(undefined) // next-auth.csrf-token
      .mockReturnValueOnce(undefined); // __Secure-next-auth.csrf-token

    (mockRequest.cookies.getAll as any).mockReturnValue([]);

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/login', subdomainUrl)
    );
    expect(result).toEqual({ redirect: true, url: expect.any(URL) });
    expect(result.url.toString()).toBe('https://app.example.com/login');
  });
});
