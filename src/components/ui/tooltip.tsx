'use client';

import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

interface TooltipContentProps {
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  content,
  position,
  isVisible,
}) => {
  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}
      role='tooltip'
    >
      {content}
      <div
        className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
          position === 'top'
            ? 'top-full left-1/2 -translate-x-1/2'
            : position === 'bottom'
              ? 'bottom-full left-1/2 -translate-x-1/2'
              : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2'
                : 'right-full top-1/2 -translate-y-1/2'
        }`}
      />
    </div>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className='relative inline-block'
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <TooltipContent
        content={content}
        position={position}
        isVisible={isVisible}
      />
    </div>
  );
};

export const TooltipTrigger: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

export const TooltipContentWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};
