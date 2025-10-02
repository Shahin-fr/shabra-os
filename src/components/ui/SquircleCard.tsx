'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, MotionProps } from 'framer-motion';

interface SquircleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'elevated' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const squircleVariants = {
  default: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgb(229, 231, 235)', // border-gray-200
    shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
  subtle: {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgb(229, 231, 235)', // border-gray-200
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  interactive: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgb(209, 213, 219)', // border-gray-300
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
  elevated: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgb(209, 213, 219)', // border-gray-300
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgb(229, 231, 235)', // border-gray-200
    shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

const sizeVariants = {
  sm: 'rounded-[12px]',
  md: 'rounded-[16px]',
  lg: 'rounded-[20px]',
  xl: 'rounded-[24px]',
};

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const SquircleCard = React.forwardRef<HTMLDivElement, SquircleCardProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'md', 
    padding = 'md',
    animated = true,
    hoverable = false,
    className,
    style,
    ...props 
  }, ref) => {
    const variantStyle = squircleVariants[variant];
    const sizeClass = sizeVariants[size];
    const paddingClass = paddingVariants[padding];

    const baseClasses = cn(
      'relative overflow-hidden transition-all duration-300 ease-out',
      'backdrop-blur-2xl',
      sizeClass,
      paddingClass,
      hoverable && 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/50',
      className
    );

    const squircleStyle: React.CSSProperties = {
      background: variantStyle.background,
      border: variantStyle.border,
      boxShadow: variantStyle.shadow,
      ...style,
    };

    // Create the squircle mask using CSS clip-path
    const squircleMask = `
      polygon(
        0% 0%, 
        0% calc(100% - 20px), 
        20px 100%, 
        calc(100% - 20px) 100%, 
        100% calc(100% - 20px), 
        100% 20px, 
        calc(100% - 20px) 0%, 
        20px 0%
      )
    `;

    const cardStyle: React.CSSProperties = {
      ...squircleStyle,
      clipPath: squircleMask,
      WebkitClipPath: squircleMask,
    };

    if (!animated) {
      return (
        <div
          ref={ref}
          className={baseClasses}
          style={cardStyle}
          {...props}
        >
          {children}
        </div>
      );
    }

    const motionProps: MotionProps = {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for Apple-like feel
      },
      whileHover: hoverable ? { 
        y: -4, 
        transition: { duration: 0.3, ease: 'easeOut' }
      } : undefined,
    };

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        style={cardStyle}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SquircleCard.displayName = 'SquircleCard';

// Specialized variants for specific use cases
export const SquircleWidget = React.forwardRef<HTMLDivElement, SquircleCardProps>(
  (props, ref) => (
    <SquircleCard
      ref={ref}
      variant="default"
      size="lg"
      padding="lg"
      hoverable={true}
      {...props}
    />
  )
);

export const SquircleButton = React.forwardRef<HTMLDivElement, SquircleCardProps>(
  (props, ref) => (
    <SquircleCard
      ref={ref}
      variant="interactive"
      size="md"
      padding="md"
      hoverable={true}
      {...props}
    />
  )
);

export const SquircleModal = React.forwardRef<HTMLDivElement, SquircleCardProps>(
  (props, ref) => (
    <SquircleCard
      ref={ref}
      variant="elevated"
      size="xl"
      padding="xl"
      animated={true}
      {...props}
    />
  )
);

SquircleWidget.displayName = 'SquircleWidget';
SquircleButton.displayName = 'SquircleButton';
SquircleModal.displayName = 'SquircleModal';