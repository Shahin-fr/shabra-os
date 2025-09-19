'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

import { HeroHeaderProps } from '@/types/admin-dashboard';

export function HeroHeader({ title, subtitle, className = '' }: HeroHeaderProps) {
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <OptimizedMotion
      className={`text-center space-y-6 ${className}`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <OptimizedMotion
        as="h1"
        className="text-4xl md:text-5xl font-bold text-[#393d3f]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {title}
      </OptimizedMotion>
      <OptimizedMotion
        as="p"
        className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {subtitle}
      </OptimizedMotion>
    </OptimizedMotion>
  );
}

