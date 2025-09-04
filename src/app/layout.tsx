import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import React from 'react';

import './globals.css';
import './navigation-states.css';
import { ResponsiveProvider } from '@/components/providers/ResponsiveProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PWARegistration } from '@/components/ui/PWARegistration';

import Providers from './providers';

const vazirmatn = localFont({
  src: '../../public/fonts/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shabra OS',
  description:
    'A high-performance, scalable, and maintainable internal platform',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shabra OS',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'application-name': 'Shabra OS',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Shabra OS',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#ffffff',
    'msapplication-tap-highlight': 'no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fa' dir='rtl'>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ResponsiveProvider>
          <Providers>
            <DashboardLayout>{children}</DashboardLayout>
          </Providers>
        </ResponsiveProvider>
        <PWARegistration />
      </body>
    </html>
  );
}
