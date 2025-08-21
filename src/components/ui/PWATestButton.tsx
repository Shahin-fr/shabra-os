"use client";

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Download, CheckCircle, XCircle, Info } from 'lucide-react';

export function PWATestButton() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'installable' | 'installed' | 'error'>('idle');

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
      const checkInstallStatus = () => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setStatus('installed');
        } else {
          setStatus('idle');
        }
      };

      checkInstallStatus();
      window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstallStatus);

      // Listen for PWA installable state
      const checkInstallable = () => {
        if ((window as any).isInstallable) {
          setStatus('installable');
        }
      };

      // Check immediately and set up interval
      checkInstallable();
      const interval = setInterval(checkInstallable, 1000);

      return () => {
        window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstallStatus);
        clearInterval(interval);
      };
    }
  }, []);

  const handleInstallClick = () => {
    if (typeof window !== 'undefined' && (window as any).showInstallPrompt) {
      (window as any).showInstallPrompt();
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            در حال بررسی...
          </>
        );
      case 'installable':
        return (
          <>
            <Download className="h-4 w-4 mr-2" />
            نصب اپلیکیشن
          </>
        );
      case 'installed':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            نصب شده
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            خطا در نصب
          </>
        );
      default:
        return (
          <>
            <Info className="h-4 w-4 mr-2" />
            بررسی PWA
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (status) {
      case 'installable':
        return 'default';
      case 'installed':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isButtonDisabled = status === 'checking' || status === 'installed';

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={getButtonVariant()}
        onClick={handleInstallClick}
        disabled={isButtonDisabled}
        className="w-full"
      >
        {getButtonContent()}
      </Button>
      
      {status === 'idle' && (
        <p className="text-xs text-muted-foreground text-center">
          برای تست PWA، این دکمه را کلیک کنید
        </p>
      )}
      
      {status === 'installable' && (
        <p className="text-xs text-green-600 text-center">
          اپلیکیشن قابل نصب است!
        </p>
      )}
      
      {status === 'installed' && (
        <p className="text-xs text-blue-600 text-center">
          اپلیکیشن قبلاً نصب شده است
        </p>
      )}
      
      {status === 'error' && (
        <p className="text-xs text-red-600 text-center">
          خطا در نصب. لطفاً دوباره تلاش کنید
        </p>
      )}
    </div>
  );
}
