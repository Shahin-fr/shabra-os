'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Calendar, 
  Target,
  // Plus,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
  animated?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  animated = true
}: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : false}
      animate={animated ? "visible" : false}
    >
      {/* Icon */}
      <motion.div
        className="mb-6"
        variants={animated ? itemVariants : undefined}
      >
        {icon || (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-lg font-semibold text-gray-900 font-vazirmatn mb-2"
        variants={animated ? itemVariants : undefined}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-gray-600 font-vazirmatn mb-6 max-w-md"
        variants={animated ? itemVariants : undefined}
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.div variants={animated ? itemVariants : undefined}>
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            className="font-vazirmatn"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Predefined empty states for common scenarios
export function EmptyTasks({ onAddTask }: { onAddTask: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Target className="h-8 w-8 text-blue-500" />
        </div>
      }
      title="هیچ کاری یافت نشد"
      description="هنوز هیچ کاری برای شما تعریف نشده است. اولین کار خود را ایجاد کنید!"
      action={{
        label: "کار جدید ایجاد کنید",
        onClick: onAddTask,
        variant: "primary"
      }}
    />
  );
}

export function EmptyRequests({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-orange-500" />
        </div>
      }
      title="هیچ درخواستی یافت نشد"
      description="هنوز هیچ درخواستی ارسال نکرده‌اید. اولین درخواست خود را ارسال کنید!"
      action={{
        label: "درخواست جدید",
        onClick: onNewRequest,
        variant: "primary"
      }}
    />
  );
}

export function EmptyTeam({ onInviteMember }: { onInviteMember: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Users className="h-8 w-8 text-green-500" />
        </div>
      }
      title="هیچ عضو تیمی یافت نشد"
      description="هنوز هیچ عضوی به تیم شما اضافه نشده است. اولین عضو را دعوت کنید!"
      action={{
        label: "دعوت عضو جدید",
        onClick: onInviteMember,
        variant: "primary"
      }}
    />
  );
}

export function EmptyCalendar({ onAddEvent }: { onAddEvent: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-purple-500" />
        </div>
      }
      title="هیچ رویدادی یافت نشد"
      description="هنوز هیچ رویدادی در تقویم شما وجود ندارد. اولین رویداد را اضافه کنید!"
      action={{
        label: "رویداد جدید",
        onClick: onAddEvent,
        variant: "primary"
      }}
    />
  );
}

export function EmptySearch({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
      }
      title="نتیجه‌ای یافت نشد"
      description="متأسفانه هیچ نتیجه‌ای برای جستجوی شما یافت نشد. کلمات کلیدی را تغییر دهید."
      action={{
        label: "پاک کردن جستجو",
        onClick: onClearSearch,
        variant: "outline"
      }}
    />
  );
}

export function EmptyError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
      }
      title="خطا در بارگذاری"
      description="متأسفانه در بارگذاری اطلاعات خطایی رخ داده است. لطفاً دوباره تلاش کنید."
      action={{
        label: "تلاش مجدد",
        onClick: onRetry,
        variant: "primary"
      }}
    />
  );
}

export function EmptySuccess({ message }: { message: string }) {
  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      }
      title="عالی!"
      description={message}
      animated={true}
    />
  );
}

// Loading empty state
export function EmptyLoading() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <RefreshCw className="h-8 w-8 text-gray-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn mb-2">
        در حال بارگذاری...
      </h3>
      <p className="text-gray-600 font-vazirmatn">
        لطفاً صبر کنید
      </p>
    </motion.div>
  );
}
