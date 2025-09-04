'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  }>;
  onPress?: () => void;
  className?: string;
}

export function MobileDataCard({
  title,
  subtitle,
  description,
  status,
  metadata = [],
  actions = [],
  onPress,
  className: _className,
}: MobileDataCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'w-full cursor-pointer transition-all duration-200',
          'hover:shadow-lg hover:border-pink-200',
          'active:scale-95',
          _className
        )}
        onClick={onPress}
      >
        <CardContent className='p-4'>
          {/* Header */}
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold text-gray-900 truncate'>
                {title}
              </h3>
              {subtitle && (
                <div className='text-sm text-gray-600 mt-1 truncate'>
                  {subtitle}
                </div>
              )}
            </div>
            <div className='flex items-center gap-2 ml-2'>
              {status && (
                <Badge variant={status.variant} className='text-xs'>
                  {status.label}
                </Badge>
              )}
              {onPress && <ChevronRight className='h-4 w-4 text-gray-400' />}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
              {description}
            </p>
          )}

          {/* Metadata */}
          {metadata.length > 0 && (
            <div className='grid grid-cols-2 gap-2 mb-3'>
              {metadata.map((item, index) => (
                <div key={index} className='text-xs'>
                  <span className='text-gray-500'>{item.label}:</span>
                  <span className='text-gray-900 font-medium mr-1'>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className='flex gap-2 pt-2 border-t border-gray-100'>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className='flex-1 h-8 text-xs'
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
