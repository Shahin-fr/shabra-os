// React Hook for Memory Leak Prevention
// Implements: [CRITICAL PRIORITY 8: Memory Leak Prevention]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import { useEffect, useRef, useCallback } from 'react';

import {
  trackTimer,
  trackInterval,
  trackEventListener,
  trackPromise,
  trackObserver,
  memoryLeakPrevention,
} from '@/lib/performance/memory-leak-prevention';

export interface MemoryLeakPreventionOptions {
  enableMonitoring?: boolean;
  autoCleanup?: boolean;
  cleanupOnUnmount?: boolean;
  trackTimers?: boolean;
  trackIntervals?: boolean;
  trackEventListeners?: boolean;
  trackPromises?: boolean;
  trackObservers?: boolean;
}

export interface MemoryLeakPreventionReturn {
  trackTimer: (timer: NodeJS.Timeout) => void;
  trackInterval: (interval: NodeJS.Timeout) => void;
  trackEventListener: (element: string, listener: EventListener) => void;
  trackPromise: (promise: Promise<unknown>) => void;
  trackObserver: (
    observer: MutationObserver | IntersectionObserver | ResizeObserver
  ) => void;
  cleanupResources: () => void;
  getMemoryStats: () => ReturnType<
    typeof memoryLeakPrevention.getResourceStats
  >;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * React hook for preventing memory leaks in components
 * Automatically tracks and cleans up resources to prevent memory leaks
 */
export function useMemoryLeakPrevention(
  options: MemoryLeakPreventionOptions = {}
): MemoryLeakPreventionReturn {
  const {
    enableMonitoring = true,
    autoCleanup = true,
    cleanupOnUnmount = true,
    trackTimers = true,
    trackIntervals = true,
    trackEventListeners = true,
    trackPromises = true,
    trackObservers = true,
  } = options;

  const trackedResources = useRef<{
    timers: NodeJS.Timeout[];
    intervals: NodeJS.Timeout[];
    eventListeners: Array<{ element: string; listener: EventListener }>;
    promises: Promise<unknown>[];
    observers: Array<MutationObserver | IntersectionObserver | ResizeObserver>;
  }>({
    timers: [],
    intervals: [],
    eventListeners: [],
    promises: [],
    observers: [],
  });

  // Enhanced tracking functions that store references
  const enhancedTrackTimer = useCallback(
    (timer: NodeJS.Timeout) => {
      if (trackTimers) {
        trackedResources.current.timers.push(timer);
        trackTimer(timer);
      }
    },
    [trackTimers]
  );

  const enhancedTrackInterval = useCallback(
    (interval: NodeJS.Timeout) => {
      if (trackIntervals) {
        trackedResources.current.intervals.push(interval);
        trackInterval(interval);
      }
    },
    [trackIntervals]
  );

  const enhancedTrackEventListener = useCallback(
    (element: string, listener: EventListener) => {
      if (trackEventListeners) {
        trackedResources.current.eventListeners.push({ element, listener });
        trackEventListener(element, listener);
      }
    },
    [trackEventListeners]
  );

  const enhancedTrackPromise = useCallback(
    (promise: Promise<unknown>) => {
      if (trackPromises) {
        trackedResources.current.promises.push(promise);
        trackPromise(promise);
      }
    },
    [trackPromises]
  );

  const enhancedTrackObserver = useCallback(
    (observer: MutationObserver | IntersectionObserver | ResizeObserver) => {
      if (trackObservers) {
        trackedResources.current.observers.push(observer);
        trackObserver(observer);
      }
    },
    [trackObservers]
  );

  // Cleanup function for tracked resources
  const cleanupResources = useCallback(() => {
    logger.info('Cleaning up component resources');

    // Clear timers
    trackedResources.current.timers.forEach(timer => {
      try {
        clearTimeout(timer);
        clearInterval(timer);
      } catch (error) {
        logger.warn('Error clearing timer/interval', error as Error);
      }
    });
    trackedResources.current.timers = [];

    // Disconnect observers
    trackedResources.current.observers.forEach(observer => {
      try {
        if ('disconnect' in observer) {
          observer.disconnect();
        }
      } catch (error) {
        logger.warn('Error disconnecting observer', error as Error);
      }
    });
    trackedResources.current.observers = [];

    // Clear other resources
    trackedResources.current.eventListeners = [];
    trackedResources.current.promises = [];

    logger.info('Component resource cleanup completed');
  }, []);

  // Get memory statistics
  const getMemoryStats = useCallback(() => {
    return memoryLeakPrevention.getResourceStats();
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (enableMonitoring) {
      memoryLeakPrevention.startMonitoring();
    }
  }, [enableMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (enableMonitoring) {
      memoryLeakPrevention.stopMonitoring();
    }
  }, [enableMonitoring]);

  // Auto-cleanup effect
  useEffect(() => {
    if (autoCleanup) {
      const interval = setInterval(() => {
        // Check if we have too many tracked resources
        const totalResources =
          trackedResources.current.timers.length +
          trackedResources.current.intervals.length +
          trackedResources.current.eventListeners.length +
          trackedResources.current.observers.length;

        if (totalResources > 50) {
          logger.warn('Too many tracked resources, performing cleanup');
          cleanupResources();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoCleanup, cleanupResources]);

  // Cleanup on unmount
  useEffect(() => {
    if (cleanupOnUnmount) {
      return () => {
        logger.info('Component unmounting, cleaning up resources');
        cleanupResources();
      };
    }
    return undefined;
  }, [cleanupOnUnmount, cleanupResources]);

  // Start monitoring on mount
  useEffect(() => {
    if (enableMonitoring) {
      startMonitoring();
    }

    return () => {
      if (enableMonitoring) {
        stopMonitoring();
      }
    };
  }, [enableMonitoring, startMonitoring, stopMonitoring]);

  return {
    trackTimer: enhancedTrackTimer,
    trackInterval: enhancedTrackInterval,
    trackEventListener: enhancedTrackEventListener,
    trackPromise: enhancedTrackPromise,
    trackObserver: enhancedTrackObserver,
    cleanupResources,
    getMemoryStats,
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for tracking timers with automatic cleanup
 */
export function useTimerTracking() {
  const timers = useRef<NodeJS.Timeout[]>([]);

  const setTrackedTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timers.current.push(timer);
      return timer;
    },
    []
  );

  const setTrackedInterval = useCallback(
    (callback: () => void, delay: number) => {
      const interval = setInterval(callback, delay);
      timers.current.push(interval);
      return interval;
    },
    []
  );

  const clearTrackedTimer = useCallback((timer: NodeJS.Timeout) => {
    const index = timers.current.indexOf(timer);
    if (index > -1) {
      timers.current.splice(index, 1);
    }
    clearTimeout(timer);
    clearInterval(timer);
  }, []);

  const clearAllTimers = useCallback(() => {
    timers.current.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timers.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    setTrackedTimeout,
    setTrackedInterval,
    clearTrackedTimer,
    clearAllTimers,
    activeTimers: timers.current.length,
  };
}

/**
 * Hook for tracking event listeners with automatic cleanup
 */
export function useEventListenerTracking() {
  const eventListeners = useRef<
    Array<{ element: string; listener: EventListener; type: string }>
  >([]);

  const addTrackedEventListener = useCallback(
    (
      element: string,
      type: string,
      listener: EventListener,
      options?: boolean | AddEventListenerOptions
    ) => {
      const domElement =
        typeof element === 'string' ? document.querySelector(element) : element;
      if (domElement) {
        domElement.addEventListener(type, listener, options);
        eventListeners.current.push({
          element: element as string,
          listener,
          type,
        });
      }
    },
    []
  );

  const removeTrackedEventListener = useCallback(
    (
      element: string,
      type: string,
      listener: EventListener,
      options?: boolean | EventListenerOptions
    ) => {
      const domElement =
        typeof element === 'string' ? document.querySelector(element) : element;
      if (domElement) {
        domElement.removeEventListener(type, listener, options);
        const index = eventListeners.current.findIndex(
          el =>
            el.element === element &&
            el.type === type &&
            el.listener === listener
        );
        if (index > -1) {
          eventListeners.current.splice(index, 1);
        }
      }
    },
    []
  );

  const clearAllEventListeners = useCallback(() => {
    eventListeners.current.forEach(({ element, type, listener }) => {
      const domElement = document.querySelector(element);
      if (domElement) {
        domElement.removeEventListener(type, listener);
      }
    });
    eventListeners.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllEventListeners();
    };
  }, [clearAllEventListeners]);

  return {
    addTrackedEventListener,
    removeTrackedEventListener,
    clearAllEventListeners,
    activeEventListeners: eventListeners.current.length,
  };
}

/**
 * Hook for tracking observers with automatic cleanup
 */
export function useObserverTracking() {
  const observers = useRef<
    Array<MutationObserver | IntersectionObserver | ResizeObserver>
  >([]);

  const trackMutationObserver = useCallback((observer: MutationObserver) => {
    observers.current.push(observer);
    return observer;
  }, []);

  const trackIntersectionObserver = useCallback(
    (observer: IntersectionObserver) => {
      observers.current.push(observer);
      return observer;
    },
    []
  );

  const trackResizeObserver = useCallback((observer: ResizeObserver) => {
    observers.current.push(observer);
    return observer;
  }, []);

  const disconnectObserver = useCallback(
    (observer: MutationObserver | IntersectionObserver | ResizeObserver) => {
      const index = observers.current.indexOf(observer);
      if (index > -1) {
        observers.current.splice(index, 1);
      }
      if ('disconnect' in observer) {
        observer.disconnect();
      }
    },
    []
  );

  const disconnectAllObservers = useCallback(() => {
    observers.current.forEach(observer => {
      if ('disconnect' in observer) {
        observer.disconnect();
      }
    });
    observers.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAllObservers();
    };
  }, [disconnectAllObservers]);

  return {
    trackMutationObserver,
    trackIntersectionObserver,
    trackResizeObserver,
    disconnectObserver,
    disconnectAllObservers,
    activeObservers: observers.current.length,
  };
}

// Export the logger for use in the hooks
import { logger } from '@/lib/logger';
