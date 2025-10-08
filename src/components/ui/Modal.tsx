'use client';

import React, { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/hooks/useAccessibility';
import { accessibility } from '@/lib/design-system';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  // High contrast mode support
  highContrast?: boolean;
  // Reduced motion support
  reducedMotion?: boolean;
  // Focus management
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  // Size variants
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  highContrast = false,
  reducedMotion = false,
  initialFocus,
  restoreFocus = true,
  size = 'md'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Use accessibility hook for focus management
  const { containerRef, focusFirstElement, restorePreviousFocus } = useAccessibility({
    trapFocus: true,
    restoreFocus,
    initialFocus: initialFocus?.current || closeButtonRef.current,
    onEscape: onClose,
  });

  // Size variants
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key and focus management
  useEffect(() => {
    if (isOpen) {
      // Focus first element when modal opens
      setTimeout(() => {
        focusFirstElement();
      }, 100);
    } else if (restoreFocus) {
      // Restore focus when modal closes
      restorePreviousFocus();
    }
  }, [isOpen, focusFirstElement, restoreFocus, restorePreviousFocus]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  aria-hidden="true"
                />
              </Dialog.Overlay>

              {/* Modal Content */}
              <Dialog.Content asChild>
                <motion.div
                  ref={containerRef}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.95,
                    y: 20
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.95,
                    y: 20
                  }}
                  transition={{ 
                    duration: reducedMotion ? 0 : 0.2,
                    ease: "easeOut"
                  }}
                  className={`
                    fixed top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2
                    w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden
                    bg-white/10 backdrop-blur-md border border-white/20
                    rounded-2xl shadow-2xl z-50
                    ${highContrast ? 'ring-2 ring-blue-500' : ''}
                    ${className}
                  `}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-title"
                  aria-describedby={ariaDescribedBy || "modal-content"}
                  aria-label={ariaLabel}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <Dialog.Title 
                      id="modal-title"
                      className="text-xl font-semibold text-gray-800 text-end"
                    >
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <Button
                        ref={closeButtonRef}
                        variant="ghost"
                        size="sm"
                        className={`
                          w-8 h-8 p-0 rounded-full
                          hover:bg-white/20 hover:text-gray-800
                          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                          transition-colors duration-200
                          ${highContrast ? 'focus:ring-4 focus:ring-offset-1' : ''}
                          ${reducedMotion ? 'transition-none' : ''}
                        `}
                        aria-label="بستن پنجره"
                        highContrast={highContrast}
                        reducedMotion={reducedMotion}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div 
                    id="modal-content"
                    className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
                  >
                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
