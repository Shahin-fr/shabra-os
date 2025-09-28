'use client';

import { LogOut, User, Settings, Menu, UserCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { memo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';
import { useToggleMobileSidebar } from '@/stores/uiStore';
// import { usePathname } from 'next/navigation'; // Removed unused import

// Simple status message component - memoized to prevent unnecessary re-renders
const StatusMessage = memo(
  ({ message, isVisible }: { message: string; isVisible: boolean }) => {
    if (!isVisible || !message) return null;

    return (
      <div
        className='ms-5 text-sm text-green-500 font-medium transition-opacity duration-300 bg-green-50 px-3 py-1 rounded-lg border border-green-200'
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {message}
      </div>
    );
  }
);

StatusMessage.displayName = 'StatusMessage';

export function Header() {
  const { user, logout } = useAuth();
  const [statusMessage, setStatusMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const toggleMobileSidebar = useToggleMobileSidebar();
  const isMobile = useMobile();
  // const pathname = usePathname(); // Removed unused variable

  // Get user role for display
  const getUserRole = () => {
    if (!user?.roles) return 'کاربر';
    if (user.roles.includes('ADMIN')) return 'مدیر سیستم';
    if (user.roles.includes('MANAGER')) return 'مدیر پروژه';
    if (user.roles.includes('EMPLOYEE')) return 'کارمند';
    return 'کاربر';
  };

  // Get page title based on current path - removed unused function

  // Listen for custom status events
  useEffect(() => {
    const handleStatusMessage = (event: CustomEvent) => {
      const { message, duration = 3000 } = event.detail;
      setStatusMessage(message);
      setIsMessageVisible(true);

      setTimeout(() => {
        setIsMessageVisible(false);
      }, duration);
    };

    window.addEventListener(
      'showStatusMessage',
      handleStatusMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        'showStatusMessage',
        handleStatusMessage as EventListener
      );
    };
  }, []);

  const handleSignOut = () => {
    logout();
  };

  return (
    <header className='fixed top-0 start-0 end-0 z-50 bg-transparent'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6'>
        {/* Mobile Layout - PDD Compliant */}
        {isMobile ? (
          <>
            {/* Left: Hamburger Menu */}
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleMobileSidebar}
              className='p-2 hover:bg-[#ff0a54]/10 hover:text-[#ff0a54] transition-all duration-200 rounded-lg'
            >
              <Menu className='h-5 w-5' />
            </Button>

            {/* Center: Empty space */}
            <div className='flex-1'></div>

            {/* Right: Notification Icon */}
            <Button
              variant='ghost'
              size='sm'
              className='p-2 hover:bg-[#ff0a54]/10 hover:text-[#ff0a54] transition-all duration-200 rounded-lg relative'
            >
              <Bell className='h-5 w-5' />
              {/* Notification Badge */}
              <div className='absolute -top-1 -end-1 w-3 h-3 bg-red-500 rounded-full animate-pulse' />
            </Button>
          </>
        ) : (
          /* Desktop Layout - Keep existing design */
          <>
            {/* Left Section - Status Message */}
            <div className='flex items-center space-x-3 rtl:space-x-reverse'>
              <StatusMessage
                message={statusMessage}
                isVisible={isMessageVisible}
              />
            </div>

            {/* Right Section - User Profile */}
            {user && (
              <div className='flex items-center'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='p-2 hover:bg-[#ff0a54]/10 hover:scale-105 transition-all duration-200 rounded-full'
                    >
                      <Avatar className='h-10 w-10 ring-2 ring-[#ff0a54]/20 hover:ring-[#ff0a54]/40 transition-all duration-200'>
                        <AvatarImage
                          src={user.avatar || ''}
                          alt={user.name || ''}
                        />
                        <AvatarFallback className='bg-[#ff0a54]/20 text-[#ff0a54] font-semibold'>
                          <UserCircle className='h-6 w-6' />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='w-56 ms-4 mt-2'
                    align='end'
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <DropdownMenuLabel className='font-semibold'>
                      <div className='flex items-center space-x-2 rtl:space-x-reverse'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={user.avatar || ''}
                            alt={user.name || ''}
                          />
                          <AvatarFallback className='bg-[#ff0a54]/20 text-[#ff0a54] font-semibold'>
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='text-sm font-medium'>
                            {user.name || 'کاربر'}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {getUserRole()}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='cursor-pointer'>
                      <User className='me-2 h-4 w-4' />
                      <span>پروفایل</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>
                      <Settings className='me-2 h-4 w-4' />
                      <span>تنظیمات</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='cursor-pointer text-red-600 focus:text-red-600'
                      onClick={handleSignOut}
                    >
                      <LogOut className='me-2 h-4 w-4' />
                      <span>خروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

