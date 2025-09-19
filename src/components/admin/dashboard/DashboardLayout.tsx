'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

import { DashboardLayoutProps, AnimationVariants } from '@/types/admin-dashboard';

const animationVariants: AnimationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  },
  header: {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  },
};

export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <OptimizedMotion
      className={`min-h-screen ${className}`}
      variants={animationVariants.container}
      initial="hidden"
      animate="visible"
    >
      {/* Main Dashboard Content - Frameless Design */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        {children}
      </div>
    </OptimizedMotion>
  );
}

