'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  isRefreshing: boolean;
  pullDistance: number;
  isPulling: boolean;
  canRefresh: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 0.5,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isRefreshing: false,
    pullDistance: 0,
    isPulling: false,
    canRefresh: false,
  });

  const startY = useRef(0);
  const currentY = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || state.isRefreshing) return;

      const element = elementRef.current;
      if (!element) return;

      // Only trigger if we're at the top of the scrollable area
      if (element.scrollTop > 0) return;

      startY.current = e.touches[0]?.clientY || 0;
      currentY.current = e.touches[0]?.clientY || 0;

      setState(prev => ({
        ...prev,
        isPulling: true,
      }));
    },
    [enabled, state.isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !state.isPulling || state.isRefreshing) return;

      currentY.current = e.touches[0]?.clientY || 0;
      const pullDistance = Math.max(
        0,
        (currentY.current - startY.current) * resistance
      );
      const canRefresh = pullDistance >= threshold;

      setState(prev => ({
        ...prev,
        pullDistance,
        canRefresh,
      }));

      // Prevent default scrolling when pulling down
      if (pullDistance > 0) {
        e.preventDefault();
      }
    },
    [enabled, state.isPulling, state.isRefreshing, resistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !state.isPulling || state.isRefreshing) return;

    if (state.canRefresh) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
        pullDistance: 0,
      }));

      try {
        await onRefresh();
      } catch (error) {
        // Pull to refresh failed
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false,
      }));
    }
  }, [
    enabled,
    state.isPulling,
    state.isRefreshing,
    state.canRefresh,
    onRefresh,
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    ...state,
    elementRef,
    refreshTrigger: state.canRefresh && !state.isRefreshing,
  };
}
