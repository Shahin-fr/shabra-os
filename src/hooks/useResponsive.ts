'use client';

import { useEffect, useState } from 'react';

import { useSetIsMobile } from '@/stores/uiStore';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  isLargeMobile: boolean;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    isLargeMobile: false,
    breakpoint: 'lg',
  });

  const setIsMobile = useSetIsMobile();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateResponsiveState = () => {
      const width = window.innerWidth;

      const newState: ResponsiveState = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallMobile: width < 640,
        isLargeMobile: width >= 640 && width < 768,
        breakpoint:
          width < 640
            ? 'xs'
            : width < 768
              ? 'sm'
              : width < 1024
                ? 'md'
                : width < 1280
                  ? 'lg'
                  : width < 1400
                    ? 'xl'
                    : '2xl',
      };

      setState(newState);
      setIsMobile(newState.isMobile);
    };

    // Initial call
    updateResponsiveState();

    // Add event listener
    window.addEventListener('resize', updateResponsiveState);

    // Cleanup
    return () => window.removeEventListener('resize', updateResponsiveState);
  }, [setIsMobile]);

  return state;
}

// Convenience hooks
export const useBreakpoint = () => useResponsive().breakpoint;
export const useMobile = () => useResponsive().isMobile;
export const useTablet = () => useResponsive().isTablet;
export const useDesktop = () => useResponsive().isDesktop;
