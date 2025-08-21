"use client";

import { useEffect, useState, useCallback } from 'react';

export function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swStatus, setSwStatus] = useState<'unregistered' | 'installing' | 'waiting' | 'active' | 'redundant'>('unregistered');

  useEffect(() => {
    // DEVELOPMENT: Completely disable Service Worker and unregister existing ones
    if (process.env.NODE_ENV === 'development') {
      // Unregister any existing service workers to clean up the environment
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
        
        // Also try to unregister by scope
        navigator.serviceWorker.getRegistration('/').then((registration) => {
          if (registration) {
            registration.unregister();
          }
        });
      }
      
      // Skip all PWA functionality in development
      return;
    }

    // PRODUCTION: Full PWA functionality
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check if service worker is already registered
      navigator.serviceWorker.getRegistration()
        .then((existingRegistration) => {
          if (existingRegistration) {
            setSwRegistration(existingRegistration);
            setSwStatus(existingRegistration.active ? 'active' : 'waiting');
            
            // Check if there's an update
            if (existingRegistration.waiting) {
              // Send message to skip waiting
              existingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
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
      window.addEventListener('beforeinstallprompt', (e) => {
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
  }, []);

  const registerServiceWorker = () => {
    // Safety check - only register in production
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
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

  // Expose functions globally for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showInstallPrompt = showInstallPrompt;
      (window as any).isInstallable = isInstallable;
      (window as any).updateServiceWorker = updateServiceWorker;
      (window as any).pwaDebug = {
        isInstallable,
        deferredPrompt: !!deferredPrompt,
        swStatus,
        swRegistration,
        showInstallPrompt,
        updateServiceWorker,
        environment: process.env.NODE_ENV,
      };
    }
  }, [isInstallable, deferredPrompt, swStatus, swRegistration, showInstallPrompt, updateServiceWorker]);

  // Don't render anything in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return null; // This component doesn't render anything
}