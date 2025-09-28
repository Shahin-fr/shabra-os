'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  CheckSquare, 
  Calendar, 
  Inbox,
  Plus,
  X,
  FileText,
  Users,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Navigation item type
type NavigationItemType = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: boolean;
};

// Navigation items as specified in PDD
const navigationItems: NavigationItemType[] = [
  { 
    href: '/', 
    label: 'خانه', 
    icon: LayoutGrid,
  },
  { 
    href: '/tasks', 
    label: 'تسک ها', 
    icon: CheckSquare,
  },
  { 
    href: '/calendar', 
    label: 'تقویم', 
    icon: Calendar,
  },
  { 
    href: '/inbox', 
    label: 'صندوق', 
    icon: Inbox,
  },
];

// Quick Actions for FAB - matching QuickActionsWidget
const quickActions = [
  {
    id: 'assign-task',
    label: 'تسک جدید',
    icon: Plus,
    href: '/tasks/new',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
  },
  {
    id: 'create-project',
    label: 'پروژه جدید',
    icon: FileText,
    href: '/projects/new',
    color: 'bg-gradient-to-r from-green-500 to-green-600',
  },
  {
    id: 'team-meeting',
    label: 'جلسه تیم',
    icon: Users,
    href: '/meetings/new',
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
  },
  {
    id: 'announcement',
    label: 'اعلان',
    icon: Megaphone,
    href: '/announcements/new',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
  },
];

export function EnhancedMobileBottomNavigation() {
  const pathname = usePathname();
  const [isFABOpen, setIsFABOpen] = useState(false);

  // Close FAB when clicking outside or when pathname changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isFABOpen && !target.closest('[data-fab-menu]')) {
        setIsFABOpen(false);
      }
    };

    if (isFABOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    
    return undefined; // Explicit return for all code paths
  }, [isFABOpen]);

  // Close FAB when pathname changes
  useEffect(() => {
    setIsFABOpen(false);
  }, [pathname]);

  // Animation variants - simplified to avoid type issues
  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="fixed bottom-0 start-0 end-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 pb-safe rounded-t-3xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navigationItems.map((item, _index) => {
          const isActive = pathname === item.href;

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[60px] relative group',
                  'active:scale-95',
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-[#ff0a54] hover:bg-[#ff0a54]/10'
                )}
              >
                {/* Background for active state */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #ff0a54, #ff0a54)' }}
                    layoutId="activeTab"
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  <item.icon
                    className={cn(
                      'h-6 w-6 transition-all duration-200',
                      isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    )}
                  />
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium mt-1 transition-all duration-200 relative z-10',
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#ff0a54]'
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 start-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Floating Action Button for Quick Actions */}
        <motion.div
          className="relative"
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          data-fab-menu
        >
          <button
            onClick={() => setIsFABOpen(!isFABOpen)}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 group"
            style={{
              background: 'linear-gradient(135deg, #ff0a54, #ff0a54)',
            }}
            data-fab-menu
          >
            <AnimatePresence mode="wait">
              {isFABOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isFABOpen && (
          <motion.div
            className="fixed bottom-20 start-4 z-50 flex flex-col gap-2"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, staggerChildren: 0.05 }}
            data-fab-menu
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={action.href}
                    onClick={() => setIsFABOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] group hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-end">
                      <div className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                        {action.label}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
