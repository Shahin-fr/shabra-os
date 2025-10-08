/**
 * Accessibility utility functions and helpers
 * Provides common accessibility patterns and utilities for the Shabra OS design system
 */

import React from 'react';
import { accessibility } from './design-system';

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simple contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const isAccessibleContrast = (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = level === 'AA' ? accessibility.contrast.normal : accessibility.contrast.enhanced;
  return ratio >= requiredRatio;
};

// ARIA utilities
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const buildAriaAttributes = (attributes: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(attributes).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
};

// Focus management utilities
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'area[href]',
    'iframe',
    'object',
    'embed',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

export const trapFocus = (container: HTMLElement, event: KeyboardEvent): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement as HTMLElement;

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};

// Screen reader utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// Keyboard navigation utilities
export const getNextFocusableElement = (currentElement: HTMLElement, direction: 'next' | 'previous' = 'next'): HTMLElement | null => {
  const container = currentElement.closest('[role="menu"], [role="menubar"], [role="tablist"], [role="listbox"]') as HTMLElement;
  if (!container) return null;

  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return null;
  
  const nextIndex = direction === 'next' 
    ? (currentIndex + 1) % focusableElements.length
    : currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
  
  return focusableElements[nextIndex] || null;
};

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Windows High Contrast Mode
  if (window.matchMedia('(-ms-high-contrast: active)').matches) return true;
  
  // Check for forced colors
  if (window.matchMedia('(forced-colors: active)').matches) return true;
  
  return false;
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Touch target size validation
export const isValidTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = parseInt(accessibility.touchTargets.minimum);
  
  return rect.width >= minSize && rect.height >= minSize;
};

// Form validation utilities
export const validateFormField = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string[] => {
  const errors: string[] = [];
  
  // Required field validation
  if (field.hasAttribute('required') && !field.value.trim()) {
    errors.push('این فیلد الزامی است');
  }
  
  // Email validation
  if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    errors.push('لطفاً یک ایمیل معتبر وارد کنید');
  }
  
  // URL validation
  if (field.type === 'url' && field.value && !isValidUrl(field.value)) {
    errors.push('لطفاً یک آدرس معتبر وارد کنید');
  }
  
  // Min length validation
  const minLength = field.getAttribute('minlength');
  if (minLength && field.value.length < parseInt(minLength)) {
    errors.push(`حداقل ${minLength} کاراکتر وارد کنید`);
  }
  
  // Max length validation
  const maxLength = field.getAttribute('maxlength');
  if (maxLength && field.value.length > parseInt(maxLength)) {
    errors.push(`حداکثر ${maxLength} کاراکتر وارد کنید`);
  }
  
  // Pattern validation
  const pattern = field.getAttribute('pattern');
  if (pattern && field.value && !new RegExp(pattern).test(field.value)) {
    errors.push('فرمت وارد شده صحیح نیست');
  }
  
  return errors;
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ARIA live region management
export class AriaLiveManager {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `aria-live-${priority}`;
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    region.textContent = message;
  }

  clear(priority?: 'polite' | 'assertive'): void {
    if (priority) {
      const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
      region.textContent = '';
    } else {
      this.politeRegion.textContent = '';
      this.assertiveRegion.textContent = '';
    }
  }
}

// Global ARIA live manager instance
export const ariaLiveManager = new AriaLiveManager();

// Keyboard shortcut utilities
export const createKeyboardShortcut = (
  key: string,
  modifiers: string[] = [],
  handler: (event: KeyboardEvent) => void
): (event: KeyboardEvent) => void => {
  return (event: KeyboardEvent) => {
    const isKeyMatch = event.key === key || event.code === key;
    const areModifiersMatch = modifiers.every(mod => {
      switch (mod.toLowerCase()) {
        case 'ctrl':
        case 'control':
          return event.ctrlKey;
        case 'alt':
          return event.altKey;
        case 'shift':
          return event.shiftKey;
        case 'meta':
        case 'cmd':
          return event.metaKey;
        default:
          return false;
      }
    });

    if (isKeyMatch && areModifiersMatch) {
      event.preventDefault();
      handler(event);
    }
  };
};

// Focus trap hook
export const useFocusTrap = (isActive: boolean) => {
  const trapRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        trapFocus(trapRef.current!, event);
      }
    };

    const container = trapRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return trapRef;
};

// Export all utilities
export const accessibilityUtils = {
  getContrastRatio,
  isAccessibleContrast,
  generateAriaId,
  buildAriaAttributes,
  getFocusableElements,
  trapFocus,
  announceToScreenReader,
  getNextFocusableElement,
  isHighContrastMode,
  prefersReducedMotion,
  isValidTouchTarget,
  validateFormField,
  ariaLiveManager,
  createKeyboardShortcut,
  useFocusTrap,
};
