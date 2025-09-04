'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, Palette, Calendar, Users } from 'lucide-react';
import React, { useState } from 'react';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface FABAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const fabActions: FABAction[] = [
  {
    id: 'task',
    label: 'وظیفه جدید',
    icon: FileText,
    href: '/tasks/create',
    color: 'bg-blue-500',
  },
  {
    id: 'project',
    label: 'پروژه جدید',
    icon: Palette,
    href: '/projects/create',
    color: 'bg-purple-500',
  },
  {
    id: 'event',
    label: 'رویداد جدید',
    icon: Calendar,
    href: '/content-calendar/create',
    color: 'bg-orange-500',
  },
  {
    id: 'team',
    label: 'عضو تیم',
    icon: Users,
    href: '/team/invite',
    color: 'bg-green-500',
  },
];

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();
  const { hapticLight } = useHapticFeedback();

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const toggleFAB = () => {
    setIsOpen(!isOpen);
    hapticLight();
  };

  const handleActionPress = (action: FABAction) => {
    // Close FAB menu
    setIsOpen(false);
    // Haptic feedback for action selection
    hapticLight();
    // Navigate to action
    window.location.href = action.href;
  };

  return (
    <div className={cn('fixed bottom-20 right-4 z-40', className)}>
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, staggerChildren: 0.05 }}
            className='flex flex-col-reverse gap-3 mb-4'
          >
            {fabActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActionPress(action)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg',
                    'bg-white border border-gray-200/50',
                    'active:scale-95 transition-all duration-200',
                    'min-h-[44px] min-w-[44px]'
                  )}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      action.color,
                      'text-white'
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-900 whitespace-nowrap'>
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleFAB}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-r from-[#ff0a54] to-[#ff0a54]/90',
          'flex items-center justify-center',
          'active:scale-95 transition-all duration-200',
          'border-2 border-white'
        )}
        style={{
          boxShadow: '0 8px 25px rgba(255, 10, 84, 0.3)',
        }}
        whileTap={{ scale: 0.85 }}
        whileHover={{
          scale: 1.1,
          boxShadow: '0 12px 35px rgba(255, 10, 84, 0.5)',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <AnimatePresence mode='wait'>
          {isOpen ? (
            <motion.div
              key='close'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className='h-6 w-6 text-white' />
            </motion.div>
          ) : (
            <motion.div
              key='plus'
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className='h-6 w-6 text-white' />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className='fixed inset-0 bg-black/20 backdrop-blur-sm -z-10'
            style={{ marginBottom: '80px' }} // Account for bottom navigation
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing FAB state
export function useFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const openFAB = () => setIsOpen(true);
  const closeFAB = () => setIsOpen(false);
  const toggleFAB = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openFAB,
    closeFAB,
    toggleFAB,
  };
}
