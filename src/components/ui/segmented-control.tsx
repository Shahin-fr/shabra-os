'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  const selectedIndex = options.findIndex(option => option.value === value);

  return (
    <div
      className={cn(
        'relative inline-flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 w-full',
        className
      )}
    >
      {/* Background indicator */}
      <div
        className='absolute top-1 bottom-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-lg transition-all duration-300 ease-out'
        style={{
          left: `${(selectedIndex * 100) / options.length + 2}%`,
          width: `${100 / options.length - 4}%`,
        }}
      />

      {options.map(option => (
        <Button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'relative z-10 flex-1 text-center',
            'hover:text-white/90',
            value === option.value
              ? 'text-white font-semibold'
              : 'text-white/70 hover:text-white/90'
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

