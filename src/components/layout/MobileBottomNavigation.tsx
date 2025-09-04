'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface NavigationTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const navigationTabs: NavigationTab[] = [
  {
    id: 'dashboard',
    label: 'داشبورد',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'tasks',
    label: 'وظایف',
    icon: CheckSquare,
    href: '/tasks',
  },
  {
    id: 'calendar',
    label: 'تقویم',
    icon: Calendar,
    href: '/content-calendar',
  },
  {
    id: 'attendance',
    label: 'حضور',
    icon: Clock,
    href: '/attendance',
  },
  {
    id: 'profile',
    label: 'پروفایل',
    icon: User,
    href: '/profile',
  },
];

interface MobileBottomNavigationProps {
  className?: string;
}

export function MobileBottomNavigation({
  className,
}: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useResponsive();

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const handleTabPress = (href: string) => {
    router.push(href);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white/95 backdrop-blur-xl border-t border-gray-200/50',
          'safe-area-bottom',
          className
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <nav className='flex items-center justify-around px-2 py-2'>
          {navigationTabs.map(tab => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab.href)}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'min-h-[44px] min-w-[44px] px-2 py-1',
                  'rounded-xl transition-all duration-200',
                  'active:scale-95',
                  isActive
                    ? 'text-[#ff0a54] bg-[#ff0a54]/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                )}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <div className='relative'>
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      isActive ? 'scale-110' : 'scale-100'
                    )}
                  />
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='absolute -top-1 -right-1 h-4 w-4 bg-[#ff0a54] text-white text-xs rounded-full flex items-center justify-center'
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium mt-1 transition-all duration-200',
                    isActive ? 'text-[#ff0a54]' : 'text-gray-600'
                  )}
                >
                  {tab.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId='activeTab'
                    className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#ff0a54] rounded-full'
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing tab badges/notifications
export function useTabBadges() {
  // This can be extended to fetch real notification counts
  const badges = {
    tasks: 0,
    projects: 0,
    calendar: 0,
    profile: 0,
  };

  return badges;
}
