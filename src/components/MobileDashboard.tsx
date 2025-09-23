'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Home, 
  Calendar, 
  User, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Menu,
  Search
} from 'lucide-react';

// Placeholder Avatar Component
const Avatar: React.FC<{ 
  src?: string; 
  alt: string; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-sm font-bold">
          {alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

// Placeholder NotificationIcon Component
const NotificationIcon: React.FC<{ 
  hasNotification?: boolean; 
  count?: number;
  className?: string;
}> = ({ hasNotification = false, count = 0, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Bell className="w-6 h-6 text-gray-600" />
      {hasNotification && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {count > 9 ? '9+' : count}
        </div>
      )}
    </div>
  );
};

// Placeholder TaskCard Component
const TaskCard: React.FC<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  isCompleted: boolean;
  className?: string;
}> = ({ title, description, priority, dueDate, isCompleted, className = '' }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  const priorityIcons = {
    high: <AlertCircle className="w-4 h-4 text-red-500" />,
    medium: <Clock className="w-4 h-4 text-yellow-500" />,
    low: <CheckCircle className="w-4 h-4 text-green-500" />
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${priorityColors[priority]} ${isCompleted ? 'opacity-60' : ''} ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {priorityIcons[priority]}
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
        {isCompleted && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>
      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{dueDate}</span>
        <Button 
          size="sm" 
          variant={isCompleted ? "ghost" : "primary"}
          className="text-xs px-3 py-1 h-7"
        >
          {isCompleted ? 'تکمیل شده' : 'مشاهده'}
        </Button>
      </div>
    </div>
  );
};

// Placeholder BottomNavbar Component
const BottomNavbar: React.FC<{ 
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}> = ({ activeTab = 'home', onTabChange, className = '' }) => {
  const navItems = [
    { id: 'home', label: 'خانه', icon: Home },
    { id: 'calendar', label: 'تقویم', icon: Calendar },
    { id: 'profile', label: 'پروفایل', icon: User },
    { id: 'settings', label: 'تنظیمات', icon: Settings }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 safe-area-pb ${className}`}>
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-pink-500 bg-pink-50' 
                  : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Main MobileDashboard Component
const MobileDashboard: React.FC = () => {
  // Mock data for the dashboard
  const user = {
    name: 'احمد محمدی',
    role: 'مدیر پروژه',
    avatar: undefined
  };

  const urgentTasks = [
    {
      id: 1,
      title: 'بررسی گزارش ماهانه',
      description: 'بررسی و تحلیل گزارش عملکرد تیم در ماه گذشته',
      priority: 'high' as const,
      dueDate: 'امروز',
      isCompleted: false
    },
    {
      id: 2,
      title: 'ارسال پیشنهادات',
      description: 'ارسال پیشنهادات جدید به تیم مدیریت',
      priority: 'medium' as const,
      dueDate: 'فردا',
      isCompleted: false
    },
    {
      id: 3,
      title: 'بروزرسانی مستندات',
      description: 'بروزرسانی مستندات فنی پروژه',
      priority: 'low' as const,
      dueDate: 'هفته آینده',
      isCompleted: true
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'پیام جدید از تیم',
      description: 'تیم توسعه درخواست ملاقات جدیدی دارد',
      time: '۵ دقیقه پیش',
      isRead: false
    },
    {
      id: 2,
      title: 'یادآوری جلسه',
      description: 'جلسه هفتگی تیم در ۱۰ دقیقه آینده',
      time: '۱۵ دقیقه پیش',
      isRead: false
    },
    {
      id: 3,
      title: 'تکمیل پروژه',
      description: 'پروژه جدید با موفقیت تکمیل شد',
      time: '۱ ساعت پیش',
      isRead: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-transparent safe-area-pt">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={user.avatar} 
              alt={user.name} 
              size="md"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                سلام، {user.name}
              </h1>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <NotificationIcon 
              hasNotification={true} 
              count={2}
            />
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Welcome Message */}
        <div className="glass-morphism rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            خوش آمدید به داشبورد شبرا
          </h2>
          <p className="text-gray-600 text-sm">
            امروز {new Date().toLocaleDateString('fa-IR')} است. 
            {urgentTasks.filter(task => !task.isCompleted).length} کار فوری دارید.
          </p>
        </div>

        {/* Urgent Tasks Widget */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              کارهای فوری
            </h3>
            <Button variant="ghost" size="sm" className="text-pink-500">
              مشاهده همه
            </Button>
          </div>
          
          <div className="glass-morphism rounded-2xl p-4 space-y-3">
            {urgentTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                dueDate={task.dueDate}
                isCompleted={task.isCompleted}
              />
            ))}
          </div>
        </section>

        {/* Recent Notifications Widget */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              اعلانات اخیر
            </h3>
            <Button variant="ghost" size="sm" className="text-pink-500">
              مشاهده همه
            </Button>
          </div>
          
          <div className="glass-morphism rounded-2xl p-4 space-y-3">
            {recentNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-pink-50 border-pink-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                  {notification.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {notification.time}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-xs px-3 py-1 h-7"
                  >
                    مشاهده
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            اقدامات سریع
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="primary" 
              size="lg" 
              className="h-16 flex-col gap-2 glass-morphism"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm font-medium">تقویم</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="h-16 flex-col gap-2 glass-morphism"
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">تیم</span>
            </Button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavbar activeTab="home" />
    </div>
  );
};

export default MobileDashboard;
