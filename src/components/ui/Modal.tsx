'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
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
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                />
              </Dialog.Overlay>

              {/* Modal Content */}
              <Dialog.Content asChild>
                <motion.div
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
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  className={`
                    fixed top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2
                    w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden
                    bg-white/10 backdrop-blur-md border border-white/20
                    rounded-2xl shadow-2xl z-50
                    ${className}
                  `}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <Dialog.Title className="text-xl font-semibold text-gray-800 text-end">
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="
                          w-8 h-8 p-0 rounded-full
                          hover:bg-white/20 hover:text-gray-800
                          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                          transition-colors duration-200
                        "
                        aria-label="بستن"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
