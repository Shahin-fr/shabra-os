'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Settings, 
  User,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation item interface for sidebar
 */
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  isActive?: boolean;
}

/**
 * Props interface for NewMainLayout component
 */
interface NewMainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * NewMainLayout - Modern application shell with Shabra UI Design System
 * 
 * Features:
 * - Right-hand sidebar for desktop (lg and up)
 * - Minimal top header with user profile
 * - Mobile-responsive with bottom navigation placeholder
 * - Full RTL support for Persian/Farsi
 * - Hot pink (#ff0a54) primary brand color
 * - Electric blue (#00d4ff) secondary color
 * - Glassmorphism effects for modern aesthetic
 * 
 * @example
 * ```tsx
 * <NewMainLayout>
 *   <div>Your page content here</div>
 * </NewMainLayout>
 * ```
 */
const NewMainLayout: React.FC<NewMainLayoutProps> = ({ 
  children, 
  className 
}) => {
  // Navigation items for the sidebar
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'داشبورد',
      icon: LayoutDashboard,
      href: '/dashboard',
      isActive: true, // First item is active by default
    },
    {
      id: 'tasks',
      label: 'کارها',
      icon: CheckSquare,
      href: '/tasks',
    },
    {
      id: 'content',
      label: 'محتوا',
      icon: FileText,
      href: '/content',
    },
    {
      id: 'settings',
      label: 'تنظیمات',
      icon: Settings,
      href: '/settings',
    },
  ];

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Top Header - Desktop Only */}
      <header className="hidden lg:block bg-transparent">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - User Profile */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  کاربر شبرا
                </span>
                <span className="text-xs text-gray-500">
                  مدیر سیستم
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Right Sidebar - Desktop Only */}
        <aside className="hidden lg:block w-64 bg-white border-l border-gray-200 shadow-lg min-h-screen">
          <div className="p-6">
            {/* Sidebar Header */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                شبرا سیستم
              </h2>
              <p className="text-sm text-gray-500">
                سیستم مدیریت داخلی
              </p>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 group',
                      item.isActive
                        ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'w-5 h-5 transition-colors',
                        item.isActive 
                          ? 'text-pink-500' 
                          : 'text-gray-400 group-hover:text-gray-600'
                      )} 
                    />
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                    {item.isActive && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    تنظیمات پیشرفته
                  </p>
                  <p className="text-xs text-gray-500">
                    مدیریت سیستم
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:mr-0">
          {/* Mobile Header - Mobile Only */}
          <header className="lg:hidden bg-transparent safe-area-top">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    شبرا سیستم
                  </h1>
                  <p className="text-xs text-gray-500">
                    سیستم مدیریت داخلی
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>

          {/* Mobile Bottom Navigation Placeholder - Mobile Only */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
            <div className="flex items-center justify-around py-2">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors touch-target',
                      item.isActive
                        ? 'text-pink-500'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">
                      {item.label}
                    </span>
                    {item.isActive && (
                      <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Content Padding - Add bottom padding to account for bottom nav */}
          <div className="lg:hidden h-20"></div>
        </main>
      </div>
    </div>
  );
};

export default NewMainLayout;
