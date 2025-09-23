'use client';

import { motion } from 'framer-motion';
import { Plus, Users, FileText, Calendar, Megaphone, Settings } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  description: string;
}

interface QuickActionsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

const quickActions: QuickAction[] = [
  {
    id: 'assign-task',
    label: 'تسک جدید',
    icon: Plus,
    href: '/tasks/new',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'کار جدید به تیم اختصاص دهید'
  },
  {
    id: 'create-project',
    label: 'پروژه جدید',
    icon: FileText,
    href: '/projects/new',
    color: 'bg-green-500 hover:bg-green-600',
    description: 'پروژه جدید ایجاد کنید'
  },
  {
    id: 'team-meeting',
    label: 'جلسه تیم',
    icon: Users,
    href: '/meetings/new',
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'جلسه تیمی برنامه‌ریزی کنید'
  },
  {
    id: 'announcement',
    label: 'اعلان',
    icon: Megaphone,
    href: '/announcements/new',
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'اعلان جدید ارسال کنید'
  },
];

export function QuickActionsWidget({ className, variant = 'desktop', priority = 'medium' }: QuickActionsWidgetProps) {
  const isMobile = variant === 'mobile';
  const visibleActions = isMobile ? quickActions.slice(0, 4) : quickActions;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <EnhancedWidgetCard
      title="دسترسی سریع"
      variant="manager"
      priority={priority}
      className={className}
    >
      <motion.div
        className={cn(
          'grid gap-3',
          isMobile ? 'grid-cols-2' : 'grid-cols-1'
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleActions.map((action) => (
          <motion.div key={action.id} variants={itemVariants}>
            <Button
              asChild
              className={cn(
                'w-full justify-start gap-3 h-auto p-4 text-right font-vazirmatn transition-all duration-200 hover:scale-105',
                action.color,
                'text-white hover:text-white'
              )}
            >
              <a href={action.href} className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-3 w-full">
                  <action.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">
                      {action.label}
                    </div>
                    {!isMobile && (
                      <div className="text-xs opacity-90 mt-1">
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Show More Button for Mobile */}
      {isMobile && quickActions.length > 4 && (
        <motion.div
          className="mt-4"
          variants={itemVariants}
        >
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to full quick actions page
              window.location.href = '/quick-actions';
            }}
          >
            مشاهده همه اقدامات
          </Button>
        </motion.div>
      )}
    </EnhancedWidgetCard>
  );
}
