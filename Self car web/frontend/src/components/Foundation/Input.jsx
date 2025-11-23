import { forwardRef } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Input Component - Week 12 Enhanced
 * 
 * A fully accessible input component with error states, labels, helper text,
 * field-level loading state, and success state patterns.
 * Supports proper ARIA attributes and focus management.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text (required for accessibility)
 * @param {string} props.id - Input ID (auto-generated if not provided)
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Helper text below input
 * @param {boolean} props.required - Mark field as required
 * @param {boolean} props.loading - Show loading state (field-level)
 * @param {boolean} props.success - Show success state
 * @param {string} props.successMessage - Success message to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Input type (text, email, password, etc.)
 */
export const Input = forwardRef(({
  label,
  id,
  error,
  helperText,
  required = false,
  loading = false,
  success = false,
  successMessage,
  className = '',
  type = 'text',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined
  const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined
  
  const baseClasses = 'w-full px-4 py-2.5 text-base rounded-lg border transition-all duration-[120ms] focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  // State classes: error > success > loading > default
  const stateClasses = error
    ? 'border-error focus:border-error focus:ring-error/20 bg-red-50 dark:bg-red-900/10 dark:border-red-500'
    : success
    ? 'border-success focus:border-success focus:ring-success/20 bg-green-50 dark:bg-green-900/10 dark:border-green-500'
    : loading
    ? 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-dark-bg-secondary dark:border-dark-border-default'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-dark-bg-secondary dark:border-dark-border-default dark:text-dark-text-primary dark:focus:border-primary-400'
  
  const inputClasses = `${baseClasses} ${stateClasses} ${className}`
  
  // Icon classes based on state
  const iconClasses = 'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary"
        >
          {label}
          {required && (
            <span className="ml-1 text-error" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`${inputClasses} ${loading || success ? 'pr-10' : ''}`}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required}
          disabled={loading || props.disabled}
          {...props}
        />
        
        {/* Loading State Icon */}
        {loading && (
          <div className={iconClasses} aria-hidden="true">
            <Loader2 size={18} className="animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        )}
        
        {/* Success State Icon */}
        {success && !loading && (
          <div className={iconClasses} aria-hidden="true">
            <CheckCircle size={18} className="text-success dark:text-green-400" />
          </div>
        )}
        
        {/* Error State Icon */}
        {error && !loading && !success && (
          <div className={iconClasses} aria-hidden="true">
            <AlertCircle size={18} className="text-error dark:text-red-400" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-error flex items-center gap-1.5"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      
      {/* Success Message */}
      {success && successMessage && !error && (
        <p
          className="mt-1.5 text-sm text-success flex items-center gap-1.5"
          role="status"
          aria-live="polite"
        >
          <CheckCircle size={14} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && !successMessage && (
        <p
          id={helperId}
          className="mt-1.5 text-sm text-gray-500 dark:text-dark-text-secondary"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

