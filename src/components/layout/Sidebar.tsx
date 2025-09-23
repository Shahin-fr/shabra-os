'use client';

import { AnimatePresence } from '@/lib/framer-motion-optimized';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  BookOpen,
  Calendar,
  X,
  CheckSquare,
  Clock,
  User,
  Palette,
  Calendar as CalendarIcon,
  TrendingUp,
  FileText as DocsIcon,
  Instagram,
  Megaphone,
  Inbox,
  Plus,
  FileText,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Suspense, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import {
  useMobileSidebarOpen,
  useSetMobileSidebarOpen,
} from '@/stores/uiStore';

import { NavigationItem } from './NavigationItem';

// Dynamic import for Image component to improve performance
const Image = dynamic(() => import('next/image'), {
  loading: () => (
    <div className='w-28 h-28 rounded-full bg-gray-200 animate-pulse' />
  ),
});

// Navigation item type
type NavigationItemType = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const mobileSidebarOpen = useMobileSidebarOpen();
  const setMobileSidebarOpen = useSetMobileSidebarOpen();
  const isMobile = useMobile();

  const closeSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Get user role for navigation filtering
  const getUserRole = () => {
    if (!user?.roles) return 'EMPLOYEE';
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('MANAGER')) return 'MANAGER';
    if (user.roles.includes('EMPLOYEE')) return 'EMPLOYEE';
    return 'EMPLOYEE';
  };

  const userRole = getUserRole();

  // Admin navigation items
  const adminNavigationItems: NavigationItemType[] = [
    { href: '/', label: 'داشبورد', icon: LayoutDashboard, priority: 'high' },
    { href: '/tasks', label: 'تسک‌ها', icon: CheckSquare, priority: 'high' },
    {
      href: '/projects',
      label: 'پروژه‌ها',
      icon: FolderOpen,
      priority: 'high',
    },
    {
      href: '/storyboard',
      label: 'استوری‌بورد',
      icon: Palette,
      priority: 'high',
    },
    {
      href: '/content-calendar',
      label: 'تقویم محتوا',
      icon: Calendar,
      priority: 'high',
    },
    {
      href: '/dashboard/instapulse',
      label: 'اینستاپالس',
      icon: Instagram,
      priority: 'high',
    },
    { href: '/team', label: 'تیم', icon: Users, priority: 'high' },
    { href: '/wiki', label: 'ویکی', icon: BookOpen, priority: 'medium' },
    { href: '/admin/announcements', label: 'مدیریت اعلان‌ها', icon: Megaphone, priority: 'high' },
    { href: '/admin/attendance', label: 'مدیریت حضور و غیاب', icon: Clock, priority: 'high' },
    { href: '/admin/holidays', label: 'مدیریت تعطیلات', icon: Calendar, priority: 'high' },
    { href: '/action-center', label: 'مرکز اقدامات', icon: Inbox, priority: 'high' },
    { href: '/team-calendar', label: 'تقویم تیم', icon: BarChart3, priority: 'high' },
    { href: '/admin/checklist-templates', label: 'قالب‌های چک‌لیست', icon: ClipboardList, priority: 'high' },
    { href: '/settings', label: 'تنظیمات', icon: Settings, priority: 'low' },
  ];

  // Manager navigation items
  const managerNavigationItems: NavigationItemType[] = [
    { href: '/', label: 'داشبورد', icon: LayoutDashboard, priority: 'high' },
    { href: '/tasks', label: 'تسک‌ها', icon: CheckSquare, priority: 'high' },
    { href: '/projects', label: 'پروژه‌ها', icon: FolderOpen, priority: 'high' },
    { href: '/inbox', label: 'صندوق ورودی', icon: Inbox, priority: 'high' },
    { href: '/team', label: 'مدیریت تیم', icon: Users, priority: 'high' },
    { href: '/action-center', label: 'مرکز اقدامات', icon: Inbox, priority: 'high' },
    { href: '/team-calendar', label: 'تقویم تیم', icon: BarChart3, priority: 'high' },
    { href: '/settings', label: 'تنظیمات', icon: Settings, priority: 'low' },
  ];

  // Employee navigation items
  const employeeNavigationItems: NavigationItemType[] = [
    { href: '/', label: 'خانه', icon: LayoutDashboard, priority: 'high' },
    { href: '/tasks', label: 'تسک‌ها', icon: CheckSquare, priority: 'high' },
    { href: '/calendar', label: 'تقویم', icon: Calendar, priority: 'high' },
    { href: '/inbox', label: 'صندوق ورودی', icon: Inbox, priority: 'high' },
    { href: '/projects', label: 'پروژه‌ها', icon: FolderOpen, priority: 'medium' },
    { href: '/new-request', label: 'درخواست جدید', icon: Plus, priority: 'high' },
    { href: '/requests', label: 'درخواست‌های من', icon: FileText, priority: 'high' },
    { href: '/attendance', label: 'حضور و غیاب', icon: Clock, priority: 'high' },
    { href: '/wiki', label: 'شبرالوگ', icon: BookOpen, priority: 'medium' },
    { href: '/docs', label: 'مستندات من', icon: FileText, priority: 'medium' },
    { href: `/profile/${user?.id}`, label: 'پروفایل من', icon: User, priority: 'medium' },
    { href: '/settings', label: 'تنظیمات', icon: Settings, priority: 'low' },
  ];

  // Get navigation items based on user role
  const navigationItems = (() => {
    if (userRole === 'ADMIN') return adminNavigationItems;
    if (userRole === 'MANAGER') return managerNavigationItems;
    return employeeNavigationItems;
  })();

  // Instant navigation handler - no debouncing or delays
  const handleItemClick = useCallback(
    (href: string) => {
      // Close mobile sidebar when navigating
      setMobileSidebarOpen(false);

      // Navigate immediately
      router.push(href);
    },
    [router, setMobileSidebarOpen]
  );

  // Mobile sidebar with enhanced animations
  const MobileSidebar = () => {
    if (!mobileSidebarOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <OptimizedMotion
          className='fixed inset-0 bg-black/50 z-50 lg:hidden'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          onClick={closeSidebar}
        />

        {/* Sidebar */}
        <OptimizedMotion
          className='fixed right-0 top-0 h-full w-80 max-w-[85vw] z-[60] lg:hidden'
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
            mass: 1.2,
            duration: 0.8,
          }}
        >
          <div className='h-full bg-gradient-to-b from-slate-50/95 via-pink-50/95 to-purple-50/95 backdrop-blur-xl border-l border-white/20 shadow-2xl'>
            {/* Close Button for Mobile */}
            <OptimizedMotion
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className='flex justify-end p-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={closeSidebar}
                  className='p-2 hover:bg-[#ff0a54]/10 hover:text-[#ff0a54] transition-all duration-200 rounded-lg hover:scale-110 active:scale-95'
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>
            </OptimizedMotion>

            {/* Floating Logo - Simplified */}
            <OptimizedMotion
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6,
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className='flex justify-center pt-4 pb-8'>
              <Link href='/' className='block'>
                <div
                  className='w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 hover:border-[#ff0a54]/50 transition-all duration-200'
                  style={{
                    boxShadow: '0 4px 16px rgba(255, 10, 84, 0.2)',
                  }}
                >
                  <Suspense
                    fallback={
                      <div className='w-24 h-24 rounded-full bg-gray-200 animate-pulse' />
                    }
                  >
                    <Image
                      src='/images/shabra-logo.jpg'
                      alt='Shabra Logo'
                      width={96}
                      height={96}
                      className='w-full h-full object-cover'
                      priority
                    />
                  </Suspense>
                </div>
              </Link>
            </div>
            </OptimizedMotion>

            {/* Navigation - Enhanced glass effect */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6,
                delay: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className='flex-1 flex items-center justify-center px-4 relative'>
              <div
                className='rounded-2xl p-4 w-full max-w-56'
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <nav className='flex flex-col gap-3'>
                  {navigationItems.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                      <OptimizedMotion
                        key={item.href}
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: 0.8 + (index * 0.12),
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                        whileTap={{ 
                          scale: 0.98,
                          transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                      >
                        <NavigationItem
                          item={item}
                          isActive={isActive}
                          isClicked={false}
                          onClick={handleItemClick}
                          isMobile={true}
                        />
                      </OptimizedMotion>
                    );
                  })}
                </nav>
              </div>
            </div>
            </OptimizedMotion>
          </div>
        </OptimizedMotion>
      </>
    );
  };

  // Desktop sidebar - simple and clean
  const DesktopSidebar = () => {
    // Don't render desktop sidebar on mobile devices
    if (isMobile) return null;

    return (
      <div className='fixed right-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out w-16'>
        {/* Navigation - Icon-only with hover text */}
        <div className='flex-1 flex items-center justify-center px-2'>
          <nav className='flex flex-col gap-3 w-full'>
            {/* + New Quick Action Button for Managers */}
            {userRole === 'MANAGER' && (
              <div className='relative group mb-2'>
                <Button
                  className='w-12 h-12 rounded-xl bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95'
                  title='اقدامات جدید'
                >
                  <Plus className='h-6 w-6' />
                </Button>
                
                {/* Hover Text - Appears from left */}
                <div className='absolute left-full ml-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                  <div className='bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg shadow-lg border border-white/20 whitespace-nowrap transition-all duration-200 ease-out opacity-0 translate-x-[-10px] scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100'>
                    اقدامات جدید
                  </div>
                </div>
              </div>
            )}
            
            {navigationItems.map(item => {
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className='relative group'>
                  {/* Icon Button */}
                  <Link
                    href={item.href}
                    onClick={e => {
                      e.preventDefault();
                      handleItemClick(item.href);
                    }}
                    className={cn(
                      'nav-item flex items-center justify-center w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                      'hover:text-white hover:bg-white/20 hover:scale-105 hover:shadow-lg',
                      'active:scale-95 active:bg-white/30',
                      isActive ? 'active' : ''
                    )}
                    title={item.label}
                  >
                    {/* Ripple effect for active state */}
                    {isActive && (
                      <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#fbddec]/20 to-[#fbddec]/10 animate-pulse' />
                    )}

                    <item.icon
                      className={cn(
                        'transition-transform duration-200 h-6 w-6',
                        'group-hover:scale-110',
                        isActive ? 'text-[#fbddec]' : 'text-gray-500'
                      )}
                    />
                  </Link>

                  {/* Hover Text - Appears from left */}
                  <div className='absolute left-full ml-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                    <div className='bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg shadow-lg border border-white/20 whitespace-nowrap transition-all duration-200 ease-out opacity-0 translate-x-[-10px] scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100'>
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        <MobileSidebar key='mobile-sidebar' />
      </AnimatePresence>

      <DesktopSidebar />
    </>
  );
}

