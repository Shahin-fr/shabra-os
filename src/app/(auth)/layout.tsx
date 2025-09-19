import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';

import '../globals.css';
import '../navigation-states.css';
import { ResponsiveProvider } from '@/components/providers/ResponsiveProvider';
import { PWARegistration } from '@/components/ui/PWARegistration';

import Providers from '../providers';

const vazirmatn = localFont({
  src: '../../../public/fonts/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shabra OS - Authentication',
  description: 'Secure authentication for Shabra OS',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fa' dir='rtl' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ResponsiveProvider>
          <Providers>
            <main className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
              {children}
            </main>
          </Providers>
        </ResponsiveProvider>
        <PWARegistration />
      </body>
    </html>
  );
}

