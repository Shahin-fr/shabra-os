import * as React from "react"

import { cn } from "@/lib/utils"
import { accessibility } from '@/lib/design-system'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaRequired?: boolean;
  ariaInvalid?: boolean;
  ariaLive?: 'off' | 'polite' | 'assertive';
  // High contrast mode support
  highContrast?: boolean;
  // Reduced motion support
  reducedMotion?: boolean;
  // Auto-complete hints
  autoComplete?: string;
  // Input mode for mobile keyboards
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    errorMessage, 
    helperText, 
    id, 
    ariaLabel,
    ariaDescribedBy,
    ariaRequired,
    ariaInvalid,
    ariaLive,
    highContrast = false,
    reducedMotion = false,
    autoComplete,
    inputMode,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    // Build ARIA attributes
    const ariaAttributes = {
      'aria-label': ariaLabel,
      'aria-describedby': cn(
        error && errorMessage && errorId,
        helperText && helperId,
        ariaDescribedBy
      ),
      'aria-required': ariaRequired,
      'aria-invalid': ariaInvalid !== undefined ? ariaInvalid : error,
      'aria-live': ariaLive,
    };

    // Remove undefined values
    const cleanAriaAttributes = Object.fromEntries(
      Object.entries(ariaAttributes).filter(([_, value]) => value !== undefined && value !== '')
    );

    // Build className with accessibility enhancements
    const inputClassName = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-red-500 focus-visible:ring-red-500",
      // High contrast mode support
      highContrast && "focus-visible:ring-4 focus-visible:ring-offset-1",
      // Reduced motion support
      reducedMotion && "transition-none",
      // Ensure minimum touch target size
      "min-h-[44px]",
      className
    );
    
    return (
      <div className="w-full">
        <input
          id={inputId}
          type={type}
          className={inputClassName}
          ref={ref}
          autoComplete={autoComplete}
          inputMode={inputMode}
          {...cleanAriaAttributes}
          {...props}
        />
        {error && errorMessage && (
          <p 
            id={errorId} 
            className="mt-1 text-sm text-red-600" 
            role="alert"
            aria-live="assertive"
          >
            {errorMessage}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={helperId} 
            className="mt-1 text-sm text-gray-500"
            aria-live="polite"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

