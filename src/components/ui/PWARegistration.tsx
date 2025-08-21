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
      console.log('PWA: Development mode detected - disabling Service Worker');
      
      // Unregister any existing service workers to clean up the environment
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            console.log('PWA: Unregistering service worker in development:', registration);
            registration.unregister();
          });
        });
        
        // Also try to unregister by scope
        navigator.serviceWorker.getRegistration('/').then((registration) => {
          if (registration) {
            console.log('PWA: Unregistering service worker by scope in development');
            registration.unregister();
          }
        });
      }
      
      // Skip all PWA functionality in development
      return;
    }

    // PRODUCTION: Full PWA functionality
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('PWA: Production mode - Service Worker supported, starting registration...');
      
      // Check if service worker is already registered
      navigator.serviceWorker.getRegistration()
        .then((existingRegistration) => {
          if (existingRegistration) {
            console.log('PWA: Found existing service worker registration:', existingRegistration);
            setSwRegistration(existingRegistration);
            setSwStatus(existingRegistration.active ? 'active' : 'waiting');
            
            // Check if there's an update
            if (existingRegistration.waiting) {
              console.log('PWA: Service worker update available');
              // Send message to skip waiting
              existingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          } else {
            // Register new service worker
            console.log('PWA: No existing registration, registering new service worker...');
            registerServiceWorker();
          }
        })
        .catch((error) => {
          console.error('PWA: Error checking existing registration:', error);
          registerServiceWorker();
        });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Service worker controller changed');
        window.location.reload();
      });

      // Handle beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA: Install prompt event received');
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
        console.log('PWA: Install prompt available, user can install');
      });

      // Handle app installed event
      window.addEventListener('appinstalled', () => {
        console.log('PWA: App was successfully installed');
        setDeferredPrompt(null);
        setIsInstallable(false);
      });

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA: App is already installed and running in standalone mode');
        setIsInstallable(false);
      }

      // Check if manifest is loading
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        console.log('PWA: Manifest link found:', manifestLink.getAttribute('href'));
      } else {
        console.warn('PWA: No manifest link found in document head');
      }

      // Log current display mode
      console.log('PWA: Current display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    } else {
      console.log('PWA: Service Worker not supported in this browser');
    }
  }, []);

  const registerServiceWorker = () => {
    // Safety check - only register in production
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: Skipping service worker registration in development');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('PWA: Service Worker registered successfully:', registration);
        setSwRegistration(registration);
        setSwStatus('installing');

        // Listen for service worker state changes
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('PWA: Service worker state changed:', newWorker.state);
              setSwStatus(newWorker.state as any);
              
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PWA: Service worker update available');
              }
            });
          }
        });

        // Check if service worker is already active
        if (registration.active) {
          console.log('PWA: Service worker is already active');
          setSwStatus('active');
        }
      })
      .catch((registrationError) => {
        console.error('PWA: Service Worker registration failed:', registrationError);
        setSwStatus('redundant');
      });
  };

  // Function to show install prompt
  const showInstallPrompt = useCallback(async () => {
    // Safety check - only show prompt in production
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: Install prompt disabled in development');
      return;
    }

    if (deferredPrompt) {
      console.log('PWA: Showing install prompt...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      console.log('PWA: No install prompt available');
    }
  }, [deferredPrompt]);

  // Function to update service worker
  const updateServiceWorker = useCallback(() => {
    // Safety check - only update in production
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: Service worker update disabled in development');
      return;
    }

    if (swRegistration && swRegistration.waiting) {
      console.log('PWA: Updating service worker...');
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