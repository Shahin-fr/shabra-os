'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

interface MobileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function MobileFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'ذخیره',
  isLoading = false,
  className: _className,
}: MobileFormModalProps) {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-40'
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10'>
              <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='h-8 w-8 p-0 hover:bg-gray-100'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* Content */}
            <div className='overflow-y-auto max-h-[calc(90vh-80px)]'>
              <form onSubmit={handleSubmit} className='p-4 space-y-6'>
                {children}

                {/* Footer */}
                <div className='flex gap-3 pt-4 border-t border-gray-100'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onClose}
                    className='flex-1 h-12 text-base'
                    disabled={isLoading}
                  >
                    انصراف
                  </Button>
                  {onSubmit && (
                    <Button
                      type='submit'
                      className='flex-1 h-12 text-base bg-pink-500 hover:bg-pink-600'
                      disabled={isLoading}
                    >
                      {isLoading ? 'در حال ذخیره...' : submitLabel}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
