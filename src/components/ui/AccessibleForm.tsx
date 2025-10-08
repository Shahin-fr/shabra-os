'use client';

import React, { forwardRef, useId, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { accessibility } from '@/lib/design-system';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAccessibilityAnnouncer } from '@/components/ui/AccessibilityAnnouncer';

export interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  // Form validation
  validateOnSubmit?: boolean;
  validateOnChange?: boolean;
  // Error handling
  showErrors?: boolean;
  errorPosition?: 'top' | 'bottom' | 'inline';
  // High contrast mode support
  highContrast?: boolean;
  // Reduced motion support
  reducedMotion?: boolean;
  // Form state
  isSubmitting?: boolean;
  submitError?: string;
  submitSuccess?: string;
  // Children
  children: React.ReactNode;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormContextType {
  errors: FormFieldError[];
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  isFieldValid: (field: string) => boolean;
  getFieldError: (field: string) => string | undefined;
  isSubmitting: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

const FormContext = React.createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within an AccessibleForm');
  }
  return context;
};

const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({
    className,
    ariaLabel,
    ariaDescribedBy,
    validateOnSubmit = true,
    validateOnChange = false,
    showErrors = true,
    errorPosition = 'top',
    highContrast = false,
    reducedMotion = false,
    isSubmitting = false,
    submitError,
    submitSuccess,
    children,
    onSubmit,
    ...props
  }, ref) => {
    const formId = useId();
    const [errors, setErrors] = useState<FormFieldError[]>([]);
    const { announce } = useAccessibilityAnnouncer();
    const { containerRef } = useAccessibility({
      trapFocus: false,
      restoreFocus: false,
    });

    // Error management functions
    const setError = useCallback((field: string, message: string) => {
      setErrors(prev => {
        const filtered = prev.filter(error => error.field !== field);
        return [...filtered, { field, message }];
      });
      
      // Announce error to screen readers
      announce(`خطا در فیلد ${field}: ${message}`, 'assertive');
    }, [announce]);

    const clearError = useCallback((field: string) => {
      setErrors(prev => prev.filter(error => error.field !== field));
    }, []);

    const clearAllErrors = useCallback(() => {
      setErrors([]);
    }, []);

    const isFieldValid = useCallback((field: string) => {
      return !errors.some(error => error.field === field);
    }, [errors]);

    const getFieldError = useCallback((field: string) => {
      const error = errors.find(error => error.field === field);
      return error?.message;
    }, [errors]);

    // Handle form submission
    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      if (validateOnSubmit) {
        // Clear previous errors
        clearAllErrors();
        
        // Basic validation - check required fields
        const formData = new FormData(event.currentTarget);
        const requiredFields = Array.from(event.currentTarget.querySelectorAll('[required]'));
        
        let hasErrors = false;
        requiredFields.forEach((field) => {
          const input = field as HTMLInputElement;
          if (!input.value.trim()) {
            setError(input.name || input.id, 'این فیلد الزامی است');
            hasErrors = true;
          }
        });

        if (hasErrors) {
          // Focus first error field
          const firstErrorField = event.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement;
          if (firstErrorField) {
            firstErrorField.focus();
          }
          return;
        }
      }

      // Call original onSubmit if provided
      if (onSubmit) {
        onSubmit(event);
      }
    }, [validateOnSubmit, clearAllErrors, setError, onSubmit]);

    // Context value
    const contextValue: FormContextType = {
      errors,
      setError,
      clearError,
      clearAllErrors,
      isFieldValid,
      getFieldError,
      isSubmitting,
      highContrast,
      reducedMotion,
    };

    // Build form className
    const formClassName = cn(
      'space-y-6',
      highContrast && 'ring-2 ring-blue-500 rounded-lg p-4',
      reducedMotion && 'transition-none',
      className
    );

    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={ref}
          className={formClassName}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          onSubmit={handleSubmit}
          noValidate
          {...props}
        >
          {/* Form-level errors */}
          {showErrors && submitError && (
            <div 
              className={cn(
                'p-4 rounded-md border-l-4 border-red-500 bg-red-50',
                highContrast && 'bg-red-100 border-red-700',
                errorPosition === 'top' ? 'mb-6' : 'mt-6'
              )}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">
                    خطا در ارسال فرم
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {submitError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form-level success */}
          {submitSuccess && (
            <div 
              className={cn(
                'p-4 rounded-md border-l-4 border-green-500 bg-green-50',
                highContrast && 'bg-green-100 border-green-700',
                errorPosition === 'top' ? 'mb-6' : 'mt-6'
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-green-800">
                    موفقیت
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    {submitSuccess}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form content */}
          <div ref={containerRef}>
            {children}
          </div>

          {/* Screen reader announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {isSubmitting && 'در حال ارسال فرم...'}
          </div>
        </form>
      </FormContext.Provider>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

export { AccessibleForm };
