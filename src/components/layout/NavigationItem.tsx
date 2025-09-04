'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import React, { memo, useState } from 'react';

import { cn } from '@/lib/utils';

// Navigation item interface
interface NavigationItemProps {
  item: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    priority: 'high' | 'medium' | 'low';
  };
  isActive: boolean;
  isClicked: boolean;
  onClick: (href: string) => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
}

// Performance-optimized ripple effect component
function RippleEffect({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className='absolute inset-0 rounded-xl overflow-hidden pointer-events-none'>
      <div className='absolute inset-0 bg-white/20 animate-ping' />
      <div className='absolute inset-0 bg-white/10 animate-pulse' />
    </div>
  );
}

// Memoized NavigationItem component to prevent unnecessary re-renders
export const NavigationItem = memo<NavigationItemProps>(
  ({
    item,
    isActive,
    isClicked,
    onClick,
    isCollapsed = false,
    isMobile = false,
  }) => {
    const Icon = item.icon;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link
        href={item.href}
        onClick={e => {
          e.preventDefault();
          onClick(item.href);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'nav-item flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group',
          'hover:text-white hover:bg-white/20 hover:scale-105 hover:shadow-lg',
          'active:scale-95 active:bg-white/30',
          isClicked ? 'clicked' : '',
          isActive ? 'active' : '',
          isCollapsed ? 'justify-center px-2 py-4 hover:bg-white/10' : ''
        )}
        data-priority={item.priority}
        data-active={isActive}
        data-clicked={isClicked}
        style={{
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: isActive ? 'transform, opacity' : 'auto', // Optimize for active state
        }}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Ripple effect for active state */}
        <RippleEffect isActive={isActive} />

        <Icon
          className={cn(
            'transition-transform duration-200',
            'group-hover:scale-110',
            isActive
              ? 'text-[#ff0a54]'
              : isMobile
                ? 'text-gray-900'
                : isCollapsed
                  ? 'text-gray-500'
                  : 'text-muted-foreground',
            isCollapsed ? 'h-6 w-6' : 'h-4 w-4'
          )}
        />

        {/* Simple Tooltip - Only for collapsed sidebar */}
        {isCollapsed && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className='absolute left-full ml-4 z-50 pointer-events-none'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className='px-3 py-2 rounded-lg backdrop-blur-xl bg-black/20 border border-white/20 shadow-lg'>
                  <span className='text-sm font-medium text-white whitespace-nowrap'>
                    {item.label}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Label - Only for expanded sidebar */}
        {!isCollapsed && (
          <span
            className={cn(
              'transition-all duration-200 whitespace-nowrap ml-3',
              isActive
                ? 'text-[#ff0a54]'
                : isMobile
                  ? 'text-gray-900'
                  : 'text-muted-foreground'
            )}
          >
            {item.label}
          </span>
        )}

        {/* Hover effect overlay - only for high priority items */}
        {item.priority === 'high' && !isCollapsed && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl transition-all duration-200 pointer-events-none',
              'bg-gradient-to-r from-white/0 via-white/5 to-white/0',
              'opacity-0 group-hover:opacity-100'
            )}
          />
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className='absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
            {item.label}
            <div className='absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-black/80 border-t-2 border-t-transparent border-b-2 border-b-transparent'></div>
          </div>
        )}
      </Link>
    );
  }
);

// Set display name for debugging
NavigationItem.displayName = 'NavigationItem';
