'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface MobileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function MobileFormModal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  className
}: MobileFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className={className}>
                  {children}
                </div>
              </div>

              {/* Footer Actions */}
              {(primaryAction || secondaryAction) && (
                <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                  <div className="flex gap-3">
                    {secondaryAction && (
                      <Button
                        variant="outline"
                        onClick={secondaryAction.onClick}
                        className="flex-1 h-12 rounded-xl border-gray-200"
                      >
                        {secondaryAction.label}
                      </Button>
                    )}
                    {primaryAction && (
                      <Button
                        onClick={primaryAction.onClick}
                        disabled={primaryAction.loading}
                        className="flex-1 h-12 bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white rounded-xl font-semibold"
                      >
                        {primaryAction.loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {primaryAction.label}
                            <ArrowRight className="h-4 w-4 mr-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Specialized mobile modals for common use cases
export function MobileCreateTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <MobileFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="ایجاد تسک جدید"
      primaryAction={{
        label: 'ایجاد تسک',
        onClick: () => {
          // Handle create task
          onClose();
        }
      }}
      secondaryAction={{
        label: 'انصراف',
        onClick: onClose
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان تسک
          </label>
          <input
            type="text"
            className="mobile-input w-full"
            placeholder="عنوان تسک را وارد کنید"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات
          </label>
          <textarea
            className="mobile-input w-full resize-none"
            rows={4}
            placeholder="توضیحات تسک را وارد کنید"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اولویت
            </label>
            <select className="mobile-input w-full">
              <option value="low">پایین</option>
              <option value="medium">متوسط</option>
              <option value="high">بالا</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ موعد
            </label>
            <input
              type="date"
              className="mobile-input w-full"
            />
          </div>
        </div>
      </div>
    </MobileFormModal>
  );
}
