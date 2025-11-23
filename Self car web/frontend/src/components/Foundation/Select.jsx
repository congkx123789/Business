import { forwardRef } from 'react'

/**
 * Select Component
 * 
 * A fully accessible select component with error states and labels.
 * Supports proper ARIA attributes.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text (required for accessibility)
 * @param {string} props.id - Select ID (auto-generated if not provided)
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Helper text below select
 * @param {boolean} props.required - Mark field as required
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes
 */
export const Select = forwardRef(({
  label,
  id,
  error,
  helperText,
  required = false,
  options = [],
  placeholder,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${selectId}-error` : undefined
  const helperId = helperText ? `${selectId}-helper` : undefined
  const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined
  
  const baseClasses = 'w-full px-4 py-2.5 text-base rounded-lg border transition-all duration-200 focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10'
  
  const stateClasses = error
    ? 'border-error focus:border-error focus:ring-error/20 bg-red-50 dark:bg-red-900/10 dark:border-red-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-dark-bg-secondary dark:border-dark-border-default dark:text-dark-text-primary dark:focus:border-primary-400'
  
  const selectClasses = `${baseClasses} ${stateClasses} ${className}`
  
  return (
    <div className="w-full relative">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const label = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
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

Select.displayName = 'Select'

export default Select

