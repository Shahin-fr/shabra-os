'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicLucideIconProps {
  iconName?: string;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

export function DynamicLucideIcon({
  iconName,
  className,
  fallbackIcon: FallbackIcon,
}: DynamicLucideIconProps) {
  if (!iconName) {
    return FallbackIcon ? (
      <FallbackIcon className={className} />
    ) : (
      <LucideIcons.HelpCircle className={cn('text-gray-400', className)} />
    );
  }

  const IconComponent = (LucideIcons as any)[iconName];

  if (!IconComponent) {
    return FallbackIcon ? (
      <FallbackIcon className={className} />
    ) : (
      <LucideIcons.HelpCircle className={cn('text-gray-400', className)} />
    );
  }

  return <IconComponent className={className} />;
}

