'use client';

import React, { forwardRef, useId } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
  describedBy?: string;
}

export const AccessibleFormField = forwardRef<HTMLDivElement, AccessibleFormFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className, 
    children, 
    id: providedId,
    describedBy 
  }, ref) => {
    const generatedId = useId();
    const fieldId = providedId || generatedId;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;
    
    const describedByIds = [
      error && errorId,
      helperText && helperId,
      describedBy
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <Label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {required && (
            <span className="text-red-500 me-1" aria-label="الزامی">
              *
            </span>
          )}
        </Label>
        
        <div className="relative">
          {React.isValidElement(children) 
            ? React.cloneElement(children, {
                id: fieldId,
                'aria-invalid': !!error,
                'aria-describedby': describedByIds || undefined,
                'aria-required': required,
                ...children.props
              })
            : children
          }
        </div>
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={helperId} 
            className="text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';

// Enhanced Input component with accessibility
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className, 
    id: providedId,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    const describedByIds = [
      error && errorId,
      helperText && helperId
    ].filter(Boolean).join(' ');

    return (
      <AccessibleFormField
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        id={inputId}
      >
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={describedByIds || undefined}
          aria-required={required}
          {...props}
        />
      </AccessibleFormField>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
