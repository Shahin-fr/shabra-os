'use client';

import React from 'react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SquircleCard } from './SquircleCard';
import { widgetVariants, typography } from '@/lib/design-system';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './button';
import { createComponentValidator, validateComponentProps } from '@/lib/validation/component-props';
import { z } from 'zod';

interface PerfectWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  variant?: 'manager' | 'employee' | 'success' | 'warning' | 'error';
  onRetry?: () => void;
  priority?: 'high' | 'medium' | 'low';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Validation schema for PerfectWidget props
const PerfectWidgetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  children: z.unknown(),
  className: z.string().optional(),
  headerAction: z.unknown().optional(),
  loading: z.boolean().optional(),
  error: z.string().optional(),
  empty: z.boolean().optional(),
  emptyMessage: z.string().optional(),
  emptyIcon: z.unknown().optional(),
  variant: z.enum(['manager', 'employee', 'success', 'warning', 'error']).optional(),
  onRetry: z.function().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  animated: z.boolean().optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
});

// Create validator for PerfectWidget
const perfectWidgetValidator = createComponentValidator(PerfectWidgetSchema);

export const PerfectWidget = React.forwardRef<HTMLDivElement, PerfectWidgetProps>((props, ref) => {
  // Validate props in development
  const validatedProps = validateComponentProps(props, perfectWidgetValidator, 'PerfectWidget');
  
  const {
    title,
    children,
    className,
    headerAction,
    loading = false,
    error,
    empty = false,
    emptyMessage = 'هیچ داده‌ای موجود نیست',
    emptyIcon,
    variant = 'employee',
    onRetry,
    priority = 'medium',
    animated = true,
    size = 'lg',
    ...restProps
  } = validatedProps;
  const widgetStyle = widgetVariants[variant];
  const priorityStyle = priority === 'high' ? 'ring-2 ring-red-200 ring-opacity-50' : '';
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -2, scale: 1.01 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const WidgetContent = () => (
    <SquircleCard
      variant="default"
      size={size}
      padding="lg"
      animated={animated}
      hoverable={priority === 'high'}
      className={cn(
        'relative overflow-hidden',
        priorityStyle,
        className
      )}
      style={{
        background: widgetStyle.background,
        borderColor: widgetStyle.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 
            className={cn(
              'font-semibold font-vazirmatn',
              typography.fontSize.lg[0],
              'text-brand-pink-text'
            )}
          >
            {title}
          </h3>
        </div>
        {headerAction}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </SquircleCard>
  );

  // Loading State
  if (loading) {
    return (
      <SquircleCard
        ref={ref}
        variant="default"
        size={size}
        padding="lg"
        animated={animated}
        className={cn(
          'relative overflow-hidden',
          priorityStyle,
          className
        )}
        style={{
          background: widgetStyle.background,
          borderColor: widgetStyle.border,
        }}
        {...restProps}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          {headerAction}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </SquircleCard>
    );
  }

  // Error State
  if (error) {
    return (
      <SquircleCard
        variant="default"
        size={size}
        padding="lg"
        animated={animated}
        className={cn(
          'relative overflow-hidden',
          'bg-red-50/50',
          priorityStyle,
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className={cn(
              'font-semibold font-vazirmatn',
              typography.fontSize.lg[0],
              'text-brand-pink-text'
            )}>
              {title}
            </h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          {headerAction}
        </div>
        
        <motion.div 
          className="text-center py-8"
          variants={animated ? contentVariants : undefined}
          initial={animated ? "hidden" : false}
          animate={animated ? "visible" : false}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="text-red-500 text-4xl mb-4">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className={cn(
            'text-red-600 font-vazirmatn mb-4',
            typography.fontSize.sm[0]
          )}>
            {error}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 ms-2" />
              تلاش مجدد
            </Button>
          )}
        </motion.div>
      </SquircleCard>
    );
  }

  // Empty State
  if (empty) {
    return (
      <SquircleCard
        ref={ref}
        variant="default"
        size={size}
        padding="lg"
        animated={animated}
        className={cn(
          'relative overflow-hidden',
          priorityStyle,
          className
        )}
        style={{
          background: widgetStyle.background,
          borderColor: widgetStyle.border,
        }}
        {...restProps}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 
              className={cn(
                'font-semibold font-vazirmatn',
                typography.fontSize.lg[0],
                'text-brand-pink-text'
              )}
            >
              {title}
            </h3>
          </div>
          {headerAction}
        </div>
        
        <motion.div 
          className="text-center py-8"
          variants={animated ? contentVariants : undefined}
          initial={animated ? "hidden" : false}
          animate={animated ? "visible" : false}
        >
          <div className="text-gray-400 text-4xl mb-4">
            {emptyIcon || <CheckCircle className="h-12 w-12 mx-auto" />}
          </div>
          <p className={cn(
            'text-gray-500 font-vazirmatn',
            typography.fontSize.sm[0]
          )}>
            {emptyMessage}
          </p>
        </motion.div>
      </SquircleCard>
    );
  }

  // Normal State
  if (animated) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group"
      >
        <WidgetContent />
      </motion.div>
    );
  }

  return <WidgetContent />;
});

PerfectWidget.displayName = 'PerfectWidget';

// Specialized widget variants
export const ManagerWidget = React.forwardRef<HTMLDivElement, Omit<PerfectWidgetProps, 'variant'>>(
  (props, ref) => (
    <PerfectWidget
      {...props}
      variant="manager"
      ref={ref}
    />
  )
);

export const EmployeeWidget = React.forwardRef<HTMLDivElement, Omit<PerfectWidgetProps, 'variant'>>(
  (props, ref) => (
    <PerfectWidget
      {...props}
      variant="employee"
      ref={ref}
    />
  )
);

export const SuccessWidget = React.forwardRef<HTMLDivElement, Omit<PerfectWidgetProps, 'variant'>>(
  (props, ref) => (
    <PerfectWidget
      {...props}
      variant="success"
      ref={ref}
    />
  )
);

export const WarningWidget = React.forwardRef<HTMLDivElement, Omit<PerfectWidgetProps, 'variant'>>(
  (props, ref) => (
    <PerfectWidget
      {...props}
      variant="warning"
      ref={ref}
    />
  )
);

export const ErrorWidget = React.forwardRef<HTMLDivElement, Omit<PerfectWidgetProps, 'variant'>>(
  (props, ref) => (
    <PerfectWidget
      {...props}
      variant="error"
      ref={ref}
    />
  )
);

ManagerWidget.displayName = 'ManagerWidget';
EmployeeWidget.displayName = 'EmployeeWidget';
SuccessWidget.displayName = 'SuccessWidget';
WarningWidget.displayName = 'WarningWidget';
ErrorWidget.displayName = 'ErrorWidget';


