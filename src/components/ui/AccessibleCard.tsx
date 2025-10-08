'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { accessibility } from '@/lib/design-system';

export interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  // Card variants
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'interactive';
  // Size variants
  size?: 'sm' | 'md' | 'lg' | 'xl';
  // Interactive states
  clickable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  // High contrast mode support
  highContrast?: boolean;
  // Reduced motion support
  reducedMotion?: boolean;
  // Card sections
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  // Children
  children?: React.ReactNode;
}

const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({
    className,
    ariaLabel,
    ariaDescribedBy,
    ariaLabelledBy,
    variant = 'default',
    size = 'md',
    clickable = false,
    selectable = false,
    selected = false,
    disabled = false,
    highContrast = false,
    reducedMotion = false,
    header,
    content,
    footer,
    children,
    onClick,
    onKeyDown,
    ...props
  }, ref) => {
    const cardId = useId();
    const headerId = `${cardId}-header`;
    const contentId = `${cardId}-content`;
    const footerId = `${cardId}-footer`;

    // Determine the appropriate role
    const getRole = () => {
      if (clickable) return 'button';
      if (selectable) return 'option';
      return 'region';
    };

    // Build ARIA attributes
    const ariaAttributes = {
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-selected': selectable ? selected : undefined,
      'aria-disabled': disabled,
      'aria-pressed': clickable ? selected : undefined,
    };

    // Remove undefined values
    const cleanAriaAttributes = Object.fromEntries(
      Object.entries(ariaAttributes).filter(([_, value]) => value !== undefined)
    );

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        if (onClick) {
          onClick(event as any);
        }
      }
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    // Size variants
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    // Variant styles
    const variantClasses = {
      default: 'bg-white border border-gray-200 shadow-sm',
      elevated: 'bg-white border border-gray-200 shadow-lg',
      outlined: 'bg-transparent border-2 border-gray-300',
      filled: 'bg-gray-50 border border-gray-200',
      interactive: 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300',
    };

    // Build className
    const cardClassName = cn(
      'rounded-lg transition-all duration-200',
      sizeClasses[size],
      variantClasses[variant],
      // Interactive states
      clickable && 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      selectable && 'cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      selected && 'ring-2 ring-blue-500 bg-blue-50',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      // High contrast mode
      highContrast && 'ring-2 ring-blue-600',
      // Reduced motion
      reducedMotion && 'transition-none',
      className
    );

    return (
      <div
        ref={ref}
        className={cardClassName}
        role={getRole()}
        tabIndex={clickable || selectable ? 0 : undefined}
        onClick={clickable ? onClick : undefined}
        onKeyDown={handleKeyDown}
        {...cleanAriaAttributes}
        {...props}
      >
        {/* Header */}
        {header && (
          <div 
            id={headerId}
            className="mb-4"
            role="banner"
          >
            {header}
          </div>
        )}

        {/* Content */}
        {(content || children) && (
          <div 
            id={contentId}
            className="flex-1"
            role="main"
          >
            {content || children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div 
            id={footerId}
            className="mt-4 pt-4 border-t border-gray-200"
            role="contentinfo"
          >
            {footer}
          </div>
        )}

        {/* Screen reader only content for interactive cards */}
        {(clickable || selectable) && (
          <div className="sr-only">
            {clickable && 'قابل کلیک'}
            {selectable && (selected ? 'انتخاب شده' : 'قابل انتخاب')}
            {disabled && 'غیرفعال'}
          </div>
        )}
      </div>
    );
  }
);

AccessibleCard.displayName = 'AccessibleCard';

// Card sub-components for better composition
export const AccessibleCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
  }
>(({ className, title, subtitle, action, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between', className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
});

AccessibleCardHeader.displayName = 'AccessibleCardHeader';

export const AccessibleCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-gray-700', className)}
      {...props}
    />
  );
});

AccessibleCardContent.displayName = 'AccessibleCardContent';

export const AccessibleCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-between pt-4 border-t border-gray-200', className)}
      {...props}
    />
  );
});

AccessibleCardFooter.displayName = 'AccessibleCardFooter';

export { AccessibleCard };
