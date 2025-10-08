'use client';

import React, { createContext, useContext, useState } from 'react';

interface AccessibilityAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityAnnouncerContext = createContext<AccessibilityAnnouncerContextType | null>(null);

export function useAccessibilityAnnouncer() {
  const context = useContext(AccessibilityAnnouncerContext);
  if (!context) {
    throw new Error('useAccessibilityAnnouncer must be used within an AccessibilityAnnouncerProvider');
  }
  return context;
}

interface AccessibilityAnnouncerProviderProps {
  children: React.ReactNode;
}

export function AccessibilityAnnouncerProvider({ children }: AccessibilityAnnouncerProviderProps) {
  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
  }>>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    }, 1000);
  };

  return (
    <AccessibilityAnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="polite-announcements"
      >
        {announcements
          .filter(announcement => announcement.priority === 'polite')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>
      
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="assertive-announcements"
      >
        {announcements
          .filter(announcement => announcement.priority === 'assertive')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>
    </AccessibilityAnnouncerContext.Provider>
  );
}

// Hook for announcing page changes
export function usePageAnnouncement() {
  const { announce } = useAccessibilityAnnouncer();

  const announcePageChange = (pageTitle: string) => {
    announce(`صفحه تغییر کرد: ${pageTitle}`, 'polite');
  };

  const announceError = (errorMessage: string) => {
    announce(`خطا: ${errorMessage}`, 'assertive');
  };

  const announceSuccess = (successMessage: string) => {
    announce(`موفق: ${successMessage}`, 'polite');
  };

  const announceLoading = (loadingMessage: string) => {
    announce(`${loadingMessage} در حال بارگذاری...`, 'polite');
  };

  return {
    announcePageChange,
    announceError,
    announceSuccess,
    announceLoading,
  };
}
