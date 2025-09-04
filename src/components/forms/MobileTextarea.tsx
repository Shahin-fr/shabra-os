'use client';

import { forwardRef } from 'react';

import { motion } from 'framer-motion';

import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';

interface MobileTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  className?: string;
}

export const MobileTextarea = forwardRef<
  HTMLTextAreaElement,
  MobileTextareaProps
>(({ error, className, ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Textarea
        ref={ref}
        className={cn(
          'min-h-[120px] text-base border-2 rounded-xl transition-all duration-200',
          'focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
          'placeholder:text-gray-400 resize-none',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 hover:border-gray-300',
          className
        )}
        {...props}
      />
    </motion.div>
  );
});

MobileTextarea.displayName = 'MobileTextarea';
