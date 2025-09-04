'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  position?: 'top' | 'bottom';
  showWhenOnline?: boolean;
}

type ConnectionStatus = 'online' | 'offline' | 'slow' | 'reconnecting';

export function OfflineIndicator({
  className,
  position = 'top',
  showWhenOnline = false,
}: OfflineIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        setStatus('online');
        if (showWhenOnline) {
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 2000);
        } else {
          setIsVisible(false);
        }
      } else {
        setStatus('offline');
        setIsVisible(true);
      }
    };

    const updateSlowConnection = () => {
      if (navigator.onLine && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        if (
          connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g'
        ) {
          setStatus('slow');
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 3000);
        }
      }
    };

    // Initial check
    updateOnlineStatus();
    updateSlowConnection();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateSlowConnection);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', updateSlowConnection);
      }
    };
  }, [showWhenOnline]);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          message: 'اتصال برقرار شد',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
        };
      case 'offline':
        return {
          icon: WifiOff,
          message: 'عدم اتصال به اینترنت - تغییرات ذخیره نمی‌شوند',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
        };
      case 'slow':
        return {
          icon: Wifi,
          message: 'اتصال کند - لطفاً صبر کنید',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
        };
      case 'reconnecting':
        return {
          icon: AlertCircle,
          message: 'در حال اتصال مجدد...',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
        };
      default:
        return {
          icon: Wifi,
          message: 'وضعیت اتصال نامشخص',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: position === 'top' ? -50 : 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: position === 'top' ? -50 : 50, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed left-0 right-0 z-50 px-4 py-2',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center space-x-2 space-x-reverse rounded-lg px-4 py-2 shadow-lg',
            config.bgColor,
            config.textColor
          )}
        >
          <Icon className='h-4 w-4' />
          <span className='text-sm font-medium'>{config.message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for checking connection status
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);

      if (navigator.onLine && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        setIsSlowConnection(
          connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g'
        );
      } else {
        setIsSlowConnection(false);
      }
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return {
    isOnline,
    isSlowConnection,
    isOffline: !isOnline,
  };
}
