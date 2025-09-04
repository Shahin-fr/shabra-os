'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface MobileFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const MobileFormField = forwardRef<HTMLDivElement, MobileFormFieldProps>(
  ({ label, error, required, className, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('space-y-2', className)}
      >
        <label className='block text-sm font-medium text-gray-900'>
          {label}
          {required && <span className='text-red-500 mr-1'>*</span>}
        </label>
        {children}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-sm text-red-600'
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

MobileFormField.displayName = 'MobileFormField';
