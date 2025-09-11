'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  Settings,
  Calendar,
  BarChart3,
  BookOpen,
  Palette,
  FileText,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Navigation item type
type NavigationItemType = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

// Admin navigation items
const adminNavigationItems: NavigationItemType[] = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/tasks/mobile', label: 'تسک‌ها', icon: CheckSquare },
  { href: '/projects/mobile', label: 'پروژه‌ها', icon: FolderOpen },
  { href: '/team', label: 'تیم', icon: Users },
  { href: '/attendance', label: 'حضور', icon: Clock },
  { href: '/analytics', label: 'تحلیل', icon: BarChart3 },
  { href: '/storyboard', label: 'استوری', icon: Palette },
  { href: '/calendar', label: 'تقویم', icon: Calendar },
  { href: '/wiki', label: 'ویکی', icon: BookOpen },
  { href: '/docs', label: 'مستندات', icon: FileText },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

// Employee navigation items (simplified)
const employeeNavigationItems: NavigationItemType[] = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/tasks/mobile', label: 'تسک‌ها', icon: CheckSquare },
  { href: '/attendance', label: 'حضور', icon: Clock },
  { href: '/profile', label: 'پروفایل', icon: Users },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get user role for navigation filtering
  const getUserRole = () => {
    if (!user?.roles) return 'EMPLOYEE';
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('MANAGER')) return 'MANAGER';
    if (user.roles.includes('EMPLOYEE')) return 'EMPLOYEE';
    return 'EMPLOYEE';
  };

  const userRole = getUserRole();
  const navigationItems = userRole === 'ADMIN' ? adminNavigationItems : employeeNavigationItems;

  // Show only first 5 items for better mobile UX
  const visibleItems = navigationItems.slice(0, 5);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl mobile-safe-bottom"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.href;
          
          return (
            <motion.div
              key={item.href}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.05,
                ease: 'easeOut'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px]',
                  'active:scale-95',
                  isActive 
                    ? 'bg-[#ff0a54]/10 text-[#ff0a54]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                )}
              >
                {/* Icon */}
                <div className="relative">
                  <item.icon 
                    className={cn(
                      'h-6 w-6 transition-all duration-200',
                      isActive ? 'scale-110' : 'scale-100'
                    )} 
                  />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff0a54] rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-xs font-medium mt-1 transition-all duration-200',
                  isActive ? 'text-[#ff0a54]' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}