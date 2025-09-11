'use client';

import { motion } from 'framer-motion';
import { Plus, CheckSquare, Calendar, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  href?: string;
  className?: string;
}

const variantStyles = {
  primary: 'bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg shadow-[#ff0a54]/25',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg shadow-gray-200/50 border border-gray-200',
  accent: 'bg-gradient-to-r from-[#ff0a54] to-purple-500 hover:from-[#ff0a54]/90 hover:to-purple-500/90 text-white shadow-lg shadow-purple-500/25',
};

export function FloatingActionButton({ 
  onClick, 
  variant = 'primary', 
  icon: Icon = Plus, 
  label = 'ایجاد',
  href,
  className 
}: FloatingActionButtonProps) {
  const ButtonContent = () => (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-40 flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm',
        'transition-all duration-200 active:scale-95',
        'backdrop-blur-xl border border-white/20',
        variantStyles[variant],
        className
      )}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.5,
        ease: 'easeOut'
      }}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );

  if (href) {
    return (
      <a href={href} className="block">
        <ButtonContent />
      </a>
    );
  }

  return <ButtonContent />;
}

// Pre-configured FAB variants for common actions
export function CreateTaskFAB({ onClick }: { onClick?: () => void }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      icon={CheckSquare}
      label="تسک جدید"
      variant="primary"
    />
  );
}

export function ScheduleMeetingFAB({ onClick }: { onClick?: () => void }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      icon={Calendar}
      label="جلسه جدید"
      variant="secondary"
    />
  );
}

export function AddUserFAB({ onClick }: { onClick?: () => void }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      icon={UserPlus}
      label="کاربر جدید"
      variant="accent"
    />
  );
}
