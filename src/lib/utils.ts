import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAdmin(role: string | string[]): boolean {
  if (Array.isArray(role)) {
    return role.includes('ADMIN') || role.includes('admin');
  }
  return role === 'ADMIN' || role === 'admin';
}

// Function to show status messages in the header
export function showStatusMessage(message: string, duration: number = 3000) {
  // Check if we're in the browser environment
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent('showStatusMessage', {
    detail: { message, duration },
  });
  window.dispatchEvent(event);
}
