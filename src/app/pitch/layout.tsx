import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import React from 'react';

import '../globals.css';
import '../navigation-states.css';
import { ResponsiveProvider } from '@/components/providers/ResponsiveProvider';
import { PWARegistration } from '@/components/ui/PWARegistration';
import NextTopLoader from 'nextjs-toploader';

import Providers from '../providers';

const vazirmatn = localFont({
  src: '../../../public/fonts/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'شبرا OS - سیستم عامل کسب و کار هوشمند',
  description:
    'یکپارچه‌سازی تمام فرآیندهای کسب‌وکار شما در یک پلتفرم هوشمند. مدیریت پروژه، اتوماسیون مالی و گزارش‌گیری آنی.',
  keywords: [
    'سیستم عامل کسب و کار',
    'مدیریت پروژه',
    'اتوماسیون مالی',
    'نرم افزار سازمانی',
    'ERP',
    'CRM',
    'شبرا'
  ],
  openGraph: {
    title: 'شبرا OS - سیستم عامل کسب و کار هوشمند',
    description: 'یکپارچه‌سازی تمام فرآیندهای کسب‌وکار شما در یک پلتفرم هوشمند',
    type: 'website',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شبرا OS - سیستم عامل کسب و کار هوشمند',
    description: 'یکپارچه‌سازی تمام فرآیندهای کسب‌وکار شما در یک پلتفرم هوشمند',
  },
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function PitchLayout({
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
        <NextTopLoader
          color="#EC4899"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #EC4899,0 0 5px #EC4899"
        />
        <ResponsiveProvider>
          <Providers>{children}</Providers>
        </ResponsiveProvider>
        <PWARegistration />
      </body>
    </html>
  );
}
