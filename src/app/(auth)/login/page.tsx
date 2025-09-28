'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useEffect, useState, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, status, user } = useAuth();

  // Get the callback URL from search params (set by middleware)
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, user, router, callbackUrl]);

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-[#ff0a54]' />
        <p className='text-muted-foreground'>در حال بررسی وضعیت ورود...</p>
        {/* Debug info */}
        <div className='text-xs text-gray-500 mt-2'>
          Debug: isLoading={String(isLoading)}, status={status}
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false, // Important: Do not redirect, so we can handle the error here
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password.');
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        setError('An unexpected error occurred during login.');
      }
    } catch (catchError) {
      setError('An unexpected error occurred during signIn call.');
    }
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className='w-full max-w-md p-4'
    >
      <Card
        className='w-full max-w-md'
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.15),
              0 8px 25px rgba(255, 10, 84, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
        }}
      >
        <CardHeader className='pb-6 text-center'>
          <CardTitle className='text-3xl font-bold text-foreground mb-3'>
            ورود به سیستم عامل شبرا
          </CardTitle>
          <p className='text-muted-foreground'>
            برای دسترسی به پنل مدیریت وارد شوید
          </p>
        </CardHeader>

        <CardContent className='space-y-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <OptimizedMotion
                className='p-4 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:border-red-200'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </OptimizedMotion>
            )}

            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-semibold text-foreground'
              >
                ایمیل
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className='border-border/50 focus:border-[#ff0a54]/50 focus:ring-[#ff0a54]/20 bg-white/80 backdrop-blur-sm'
                placeholder='example@email.com'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-semibold text-foreground'
              >
                رمز عبور
              </Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className='border-border/50 focus:border-[#ff0a54]/50 focus:ring-[#ff0a54]/20 bg-white/80 backdrop-blur-sm'
                placeholder='رمز عبور خود را وارد کنید'
              />
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200'
              style={{
                boxShadow: `
                    0 8px 25px rgba(255, 10, 84, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6)
                  `,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  در حال ورود...
                </>
              ) : (
                'ورود'
              )}
            </Button>
          </form>

          {process.env.NEXT_PUBLIC_ALLOW_SIGNUP === 'true' && (
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>
                حساب کاربری ندارید؟{' '}
                <Button
                  variant='link'
                  className='text-[#ff0a54] hover:text-[#ff0a54]/80 p-0 h-auto'
                >
                  ثبت نام کنید
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

