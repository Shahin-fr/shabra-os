"use client";

import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicLucideIconProps {
  iconName?: string;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  size?: number;
}

export function DynamicLucideIcon({ 
  iconName, 
  className, 
  fallbackIcon: FallbackIcon,
  size = 16 
}: DynamicLucideIconProps) {
  if (!iconName) {
    return FallbackIcon ? (
      <FallbackIcon className={className} />
    ) : (
      <div 
        className={cn("rounded border-2 border-dashed border-muted-foreground", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const IconComponent = (LucideIcons as any)[iconName];
  
  if (!IconComponent) {
    return FallbackIcon ? (
      <FallbackIcon className={className} />
    ) : (
      <div 
        className={cn("rounded border-2 border-dashed border-muted-foreground", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return <IconComponent className={className} />;
}
