'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
}

export function PageTransition({
  children,
  className,
  direction = 'up',
  duration = 0.3,
}: PageTransitionProps) {
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return {
          initial: { x: -300, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 300, opacity: 0 },
        };
      case 'right':
        return {
          initial: { x: 300, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -300, opacity: 0 },
        };
      case 'up':
        return {
          initial: { y: 300, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -300, opacity: 0 },
        };
      case 'down':
        return {
          initial: { y: -300, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 300, opacity: 0 },
        };
      default:
        return {
          initial: { y: 300, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -300, opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{
        duration,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation for lists
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  itemDelay?: number;
}

export function StaggeredList({
  children,
  className,
  itemDelay = 0.05,
}: StaggeredListProps) {
  return (
    <motion.div className={cn('space-y-3', className)}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              delay: index * itemDelay,
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Micro-interaction animations
export function MicroInteraction({
  children,
  className,
  scale = 0.95,
  duration = 0.1,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

// Slide in animation
export function SlideIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { y: 50, opacity: 0 };
      case 'down':
        return { y: -50, opacity: 0 };
      case 'left':
        return { x: 50, opacity: 0 };
      case 'right':
        return { x: -50, opacity: 0 };
      default:
        return { y: 50, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitial()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Bounce animation for success states
export function BounceIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 500,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}

// Shake animation for error states
export function Shake({
  children,
  className,
  trigger,
}: {
  children: ReactNode;
  className?: string;
  trigger: boolean;
}) {
  return (
    <motion.div
      className={className}
      animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
