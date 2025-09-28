'use client';

import React from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

// AmbientBubble component could be implemented here in the future for visual effects

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='relative flex min-h-screen flex-col rtl:flex-col-reverse bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 overflow-hidden'>
      {/* AmbientBubble visual effects could be implemented here in the future */}

      <Header />
      <Sidebar />
      <main className='relative md:me-64 p-6 mt-16 z-10'>
        <div className='relative z-10'>{children}</div>
      </main>
    </div>
  );
}

