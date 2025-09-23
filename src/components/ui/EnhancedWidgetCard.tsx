'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { widgetVariants, statusColors } from '@/lib/design-system';

interface EnhancedWidgetCardProps {
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
}

export function EnhancedWidgetCard({
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
}: EnhancedWidgetCardProps) {
  const widgetStyle = widgetVariants[variant];
  const priorityStyle = priority === 'high' ? 'ring-2 ring-red-200' : '';

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      }
    },
    hover: { 
      y: -2, 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const CardContent = () => (
    <div
      className={cn(
        'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-300',
        'hover:shadow-xl hover:bg-white/95',
        priorityStyle,
        className
      )}
      style={{
        background: widgetStyle.background,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 
            className="text-lg font-semibold text-gray-900 font-vazirmatn"
            style={{ color: widgetStyle.accent }}
          >
            {title}
          </h3>
          {priority === 'high' && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        {headerAction}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : false}
        animate={animated ? "visible" : false}
        className={cn(
          'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6',
          priorityStyle,
          className
        )}
        style={{
          background: widgetStyle.background,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            {priority === 'high' && (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          {headerAction}
        </div>
        
        <motion.div 
          className="space-y-4"
          variants={animated ? contentVariants : undefined}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : false}
        animate={animated ? "visible" : false}
        className={cn(
          'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6',
          'bg-red-50/50',
          priorityStyle,
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
              {title}
            </h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          {headerAction}
        </div>
        
        <motion.div 
          className="text-center py-8"
          variants={animated ? contentVariants : undefined}
        >
          <div className="text-red-500 text-4xl mb-4">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-600 font-vazirmatn mb-4">{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تلاش مجدد
            </Button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Empty State
  if (empty) {
    return (
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : false}
        animate={animated ? "visible" : false}
        className={cn(
          'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6',
          priorityStyle,
          className
        )}
        style={{
          background: widgetStyle.background,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 
              className="text-lg font-semibold text-gray-900 font-vazirmatn"
              style={{ color: widgetStyle.accent }}
            >
              {title}
            </h3>
          </div>
          {headerAction}
        </div>
        
        <motion.div 
          className="text-center py-8"
          variants={animated ? contentVariants : undefined}
        >
          <div className="text-gray-400 text-4xl mb-4">
            {emptyIcon || <CheckCircle className="h-12 w-12 mx-auto" />}
          </div>
          <p className="text-gray-500 font-vazirmatn">{emptyMessage}</p>
        </motion.div>
      </motion.div>
    );
  }

  // Normal State
  return (
    <motion.div
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : false}
      animate={animated ? "visible" : false}
      whileHover={animated ? "hover" : undefined}
      className="group"
    >
      <CardContent />
    </motion.div>
  );
}
