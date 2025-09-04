'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

import { logger } from '@/lib/logger';

export function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [swStatus, setSwStatus] = useState<
    'unregistered' | 'installing' | 'waiting' | 'active' | 'redundant'
  >('unregistered');
  const [cacheStatus, setCacheStatus] = useState<'unknown' | 'clean' | 'dirty'>(
    'unknown'
  );

  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  useEffect(() => {
    // DEVELOPMENT: Completely disable Service Worker and unregister existing ones
    if (process.env.NODE_ENV === 'development') {
      // Unregister any existing service workers to clean up the environment
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });

        // Also try to unregister by scope
        navigator.serviceWorker.getRegistration('/').then(registration => {
          if (registration) {
            registration.unregister();
          }
        });
      }

      // Skip all PWA functionality in development
      return;
    }

    // PRODUCTION: Full PWA functionality with enhanced cache management
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Set up message listener for service worker communication
      setupMessageListener();

      // Check if service worker is already registered
      navigator.serviceWorker
        .getRegistration()
        .then(existingRegistration => {
          if (existingRegistration) {
            setSwRegistration(existingRegistration);
            setSwStatus(existingRegistration.active ? 'active' : 'waiting');

            // Check if there's an update
            if (existingRegistration.waiting) {
              // Send message to skip waiting
              existingRegistration.waiting.postMessage({
                type: 'SKIP_WAITING',
              });
            }
          } else {
            // Register new service worker
            registerServiceWorker();
          }
        })
        .catch(() => {
          registerServiceWorker();
        });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Handle beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      // Handle app installed event
      window.addEventListener('appinstalled', () => {
        setDeferredPrompt(null);
        setIsInstallable(false);
      });

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstallable(false);
      }

      // Check if manifest is loading
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        // Silent warning
      }
    }

    // Cleanup function
    return () => {
      if (messageListenerRef.current) {
        navigator.serviceWorker?.removeEventListener(
          'message',
          messageListenerRef.current
        );
      }
    };
  }, []);

  // Set up message listener for service worker communication
  const setupMessageListener = () => {
    if (messageListenerRef.current) {
      navigator.serviceWorker.removeEventListener(
        'message',
        messageListenerRef.current
      );
    }

    messageListenerRef.current = (event: MessageEvent) => {
      const { type, data } = event.data || {};

      switch (type) {
        case 'CACHES_CLEARED':
          logger.info('Service Worker: All caches cleared');
          setCacheStatus('clean');
          break;

        case 'CONTENT_CACHE_INVALIDATED':
          logger.info(
            'Service Worker: Content cache invalidated for ${data.contentType}'
          );
          setCacheStatus('clean');
          break;

        default:
          logger.info('Service Worker message:', { type, data });
      }
    };

    navigator.serviceWorker.addEventListener(
      'message',
      messageListenerRef.current
    );
  };

  const registerServiceWorker = () => {
    // Safety check - only register in production
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(registration => {
        setSwRegistration(registration);
        setSwStatus('installing');

        // Listen for service worker state changes
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              setSwStatus(newWorker.state as any);
            });
          }
        });

        // Check if service worker is already active
        if (registration.active) {
          setSwStatus('active');
        }
      })
      .catch(() => {
        setSwStatus('redundant');
      });
  };

  // Enhanced cache management functions
  const clearAllCaches = useCallback(async () => {
    if (!swRegistration?.active) {
      logger.warn('Service Worker not active');
      return false;
    }

    try {
      // Send message to service worker to clear all caches
      swRegistration.active.postMessage({ type: 'CLEAR_CACHES' });

      // Also clear browser caches as fallback
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      setCacheStatus('clean');
      return true;
    } catch (error) {
      logger.error('Failed to clear caches:', error as Error);
      return false;
    }
  }, [swRegistration]);

  const invalidateContentCache = useCallback(
    async (contentType: 'calendar' | 'projects' | 'stories' | 'tasks') => {
      if (!swRegistration?.active) {
        logger.warn('Service Worker not active');
        return false;
      }

      try {
        // Send message to service worker to invalidate specific content
        swRegistration.active.postMessage({
          type: 'INVALIDATE_CONTENT',
          contentType,
        });

        // Also invalidate related browser caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();

            // Remove cached responses for the specified content type
            const contentKeys = keys.filter(key => {
              const url = new URL(key.url);
              return (
                url.pathname.includes(contentType) ||
                url.pathname.startsWith('/api/')
              );
            });

            await Promise.all(contentKeys.map(key => cache.delete(key)));
          }
        }

        setCacheStatus('clean');
        return true;
      } catch (error) {
        logger.error('Failed to invalidate content cache:', error as Error);
        return false;
      }
    },
    [swRegistration]
  );

  const updateCacheVersion = useCallback(
    async (newVersion: string) => {
      if (!swRegistration?.active) {
        logger.warn('Service Worker not active');
        return false;
      }

      try {
        // Send message to service worker to update cache version
        swRegistration.active.postMessage({
          type: 'UPDATE_CACHE_VERSION',
          newVersion,
        });

        setCacheStatus('clean');
        return true;
      } catch (error) {
        logger.error('Failed to update cache version:', error as Error);
        return false;
      }
    },
    [swRegistration]
  );

  // Function to show install prompt
  const showInstallPrompt = useCallback(async () => {
    // Safety check - only show prompt in production
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        // Silent success
      } else {
        // Silent dismissal
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  }, [deferredPrompt]);

  // Function to update service worker
  const updateServiceWorker = useCallback(() => {
    // Safety check - only update in production
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [swRegistration]);

  // Expose cache management functions globally for testing and external use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).cacheManager = {
        clearAllCaches,
        invalidateContentCache,
        updateCacheVersion,
        cacheStatus,
        swStatus,
      };

      (window as any).showInstallPrompt = showInstallPrompt;
      (window as any).isInstallable = isInstallable;
      (window as any).updateServiceWorker = updateServiceWorker;

      (window as any).pwaDebug = {
        isInstallable,
        deferredPrompt: !!deferredPrompt,
        swStatus,
        swRegistration,
        cacheStatus,
        showInstallPrompt,
        updateServiceWorker,
        clearAllCaches,
        invalidateContentCache,
        updateCacheVersion,
        environment: process.env.NODE_ENV,
      };
    }
  }, [
    isInstallable,
    deferredPrompt,
    swStatus,
    swRegistration,
    cacheStatus,
    showInstallPrompt,
    updateServiceWorker,
    clearAllCaches,
    invalidateContentCache,
    updateCacheVersion,
  ]);

  // Don't render anything in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return null; // This component doesn't render anything
}
