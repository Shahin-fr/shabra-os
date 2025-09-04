'use client';

import { LogOut, User, Settings, Menu } from 'lucide-react';
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

// Simple status message component - memoized to prevent unnecessary re-renders
const StatusMessage = memo(
  ({ message, isVisible }: { message: string; isVisible: boolean }) => {
    if (!isVisible || !message) return null;

    return (
      <div
        className='ml-5 text-sm text-green-500 font-medium transition-opacity duration-300 bg-green-50 px-3 py-1 rounded-lg border border-green-200'
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
    <header className='fixed top-0 left-0 right-0 z-50 bg-transparent'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6 relative'>
        {/* Left Section - Mobile Menu Button and Status Message */}
        <div className='flex items-center space-x-3 rtl:space-x-reverse'>
          {/* Hamburger Menu Button - Only visible on mobile */}
          {isMobile && (
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleMobileSidebar}
              className='p-2 hover:bg-[#ff0a54]/10 hover:text-[#ff0a54] transition-all duration-200 rounded-lg'
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Menu className='h-5 w-5' />
            </Button>
          )}

          {/* Status Message - Hidden on very small screens */}
          <div className='hidden sm:block'>
            <StatusMessage
              message={statusMessage}
              isVisible={isMessageVisible}
            />
          </div>
        </div>

        {/* Right Section - User Menu */}
        {user && (
          <div className='flex items-center space-x-2 rtl:space-x-reverse'>
            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full hover:bg-[#ff0a54]/10 transition-all duration-200'
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Avatar
                    className='h-8 w-8 border border-white/30 hover:border-[#ff0a54]/50 transition-all duration-200'
                    style={{
                      boxShadow: '0 2px 8px rgba(255, 10, 84, 0.2)',
                    }}
                  >
                    <AvatarImage
                      src={user.avatar || ''}
                      alt={user.name || ''}
                    />
                    <AvatarFallback
                      className='bg-[#ff0a54]/20 text-[#ff0a54] font-semibold'
                      style={{
                        background: 'rgba(255, 10, 84, 0.2)',
                      }}
                    >
                      <User className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-48 ml-4'
                align='end'
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <DropdownMenuLabel className='font-semibold'>
                  {user.name || 'کاربر'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer'>
                  <User className='mr-2 h-4 w-4 text-[#ff0a54]' />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  <Settings className='mr-2 h-4 w-4 text-[#ff0a54]' />
                  <span>تنظیمات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='cursor-pointer text-destructive focus:text-destructive'
                  onClick={handleSignOut}
                >
                  <LogOut className='mr-2 h-4 w-4 text-[#ff0a54]' />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
