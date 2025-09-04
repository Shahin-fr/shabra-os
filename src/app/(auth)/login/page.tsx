'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { logAuth, logError } from '@/lib/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading, status, user } = useAuth();

  // Get the callback URL from search params (set by middleware)
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      logAuth('User authenticated, redirecting to dashboard', {
        userId: user.id,
        email: user.email,
        callbackUrl,
      });
      router.push(callbackUrl);
    }
  }, [isAuthenticated, user, router, callbackUrl]);

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 p-4'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-[#ff0a54]' />
          <p className='text-muted-foreground'>در حال بررسی وضعیت ورود...</p>
          {/* Debug info */}
          <div className='text-xs text-gray-500 mt-2'>
            Debug: isLoading={String(isLoading)}, status={status}
          </div>
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

    logAuth('Login form submitted', {
      email,
      hasPassword: !!password,
      isLoading,
      status,
    });

    if (isLoading) return;

    setError('');
    const result = await login(email, password);

    logAuth('Login result received', {
      success: result.success,
      hasError: !!result.error,
    });

    if (result.success) {
      // Login successful, redirect will happen in useEffect
      return;
    }

    if (result.error) {
      logError('Login failed with error', new Error(result.error), { 
        email,
        error: result.error,
        result: result
      });
      setError(result.error);
    }
  };

  const handleTestLogin = async () => {
    logAuth('Test login button clicked');

    if (isLoading) return;

    setError('');
    logAuth('Executing test login');
    const result = await login('test@example.com', 'testpassword');

    logAuth('Test login result received', {
      success: result.success,
      hasError: !!result.error,
    });

    if (result.success) {
      // Login successful, redirect will happen in useEffect
      return;
    }

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
              ورود به شبرا OS
            </CardTitle>
            <p className='text-muted-foreground'>
              برای دسترسی به پنل مدیریت وارد شوید
            </p>
          </CardHeader>

          <CardContent className='space-y-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <motion.div
                  className='p-4 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:border-red-200'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
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
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    در حال ورود...
                  </>
                ) : (
                  'ورود'
                )}
              </Button>

              {/* Test button for debugging */}
              <Button
                type='button'
                variant='outline'
                onClick={handleTestLogin}
                className='w-full'
              >
                🧪 Test Login (Admin)
              </Button>

              {/* Debug info */}
              <div className='text-xs text-gray-500 mt-2'>
                Debug: isLoading={String(isLoading)}, status={status}, email=
                {email ? 'filled' : 'empty'}, password=
                {password ? 'filled' : 'empty'}
              </div>
            </form>

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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
