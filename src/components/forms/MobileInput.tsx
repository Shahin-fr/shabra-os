'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { forwardRef } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  className?: string;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <OptimizedMotion
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          ref={ref}
          className={cn(
            'h-12 text-base border-2 rounded-xl transition-all duration-200',
            'focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
            'placeholder:text-gray-400',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          {...props}
        />
      </OptimizedMotion>
    );
  }
);

MobileInput.displayName = 'MobileInput';

