'use client';

import { cn } from '@/lib/utils';

interface GlassmorphismPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassmorphismPanel({ children, className }: GlassmorphismPanelProps) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl bg-white/10',
        'shadow-2xl shadow-pink-500/10 rounded-2xl',
        'border border-white/20',
        'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-pink-500/30 before:to-rose-500/30 before:-z-10',
        className
      )}
    >
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}
