'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MobileSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const MobileSelect = forwardRef<HTMLButtonElement, MobileSelectProps>(
  ({ value, onValueChange, placeholder, error, className, children }, ref) => {
    return (
      <OptimizedMotion
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            ref={ref}
            className={cn(
              'h-12 text-base border-2 rounded-xl transition-all duration-200',
              'focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 hover:border-gray-300',
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
            <ChevronDown className="rtl:rotate-180 h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent className='rounded-xl border-2 border-gray-200 shadow-xl'>
            {children}
          </SelectContent>
        </Select>
      </OptimizedMotion>
    );
  }
);

MobileSelect.displayName = 'MobileSelect';

// Export SelectItem for convenience
export { SelectItem };

