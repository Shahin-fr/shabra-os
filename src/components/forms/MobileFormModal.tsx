'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

import { Button } from '@/components/ui/button';

interface MobileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
  showDelete?: boolean;
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
  onDelete,
  deleteLabel = 'حذف',
  showDelete = false,
  // className, // Removed unused parameter
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
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-40'
            onClick={onClose}
          />

          {/* Modal */}
          <OptimizedMotion
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className='fixed bottom-0 start-0 end-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10'>
              <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
            </div>

            {/* Content */}
            <div className='overflow-y-auto max-h-[calc(90vh-80px)]'>
              <form onSubmit={handleSubmit} className='p-4 space-y-8'>
                {children}

                {/* Footer */}
                <div className='flex gap-4 pt-4 border-t border-gray-100'>
                  {/* Delete button - only show when editing */}
                  {showDelete && onDelete && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={onDelete}
                      disabled={isLoading}
                      className='h-12 text-base text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                    >
                      {deleteLabel}
                    </Button>
                  )}
                  
                  {onSubmit && (
                    <Button
                      type='submit'
                      className='h-12 text-base bg-pink-500 hover:bg-pink-600'
                      disabled={isLoading}
                    >
                      {isLoading ? 'در حال ذخیره...' : submitLabel}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </OptimizedMotion>
        </>
      )}
    </AnimatePresence>
  );
}

