import { forwardRef } from 'react'

/**
 * Switch Component
 * 
 * A fully accessible toggle switch component with proper ARIA attributes.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Switch ID (auto-generated if not provided)
 * @param {boolean} props.checked - Checked/on state
 * @param {boolean} props.disabled - Disable switch
 * @param {string} props.className - Additional CSS classes
 */
export const Switch = forwardRef(({
  label,
  id,
  checked = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const stateClasses = checked
    ? 'bg-primary-500 dark:bg-primary-400'
    : 'bg-gray-300 dark:bg-dark-bg-tertiary'
  
  const switchClasses = `${baseClasses} ${stateClasses} ${className}`
  
  const thumbClasses = `inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
    checked ? 'translate-x-6' : 'translate-x-1'
  }`
  
  return (
    <div className="flex items-center">
      <button
        ref={ref}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        className={switchClasses}
        {...props}
      >
        <span className={thumbClasses} aria-hidden="true" />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          className={`ml-3 text-sm font-medium text-gray-700 dark:text-dark-text-primary ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && props.onClick?.()}
        >
          {label}
        </label>
      )}
    </div>
  )
})

Switch.displayName = 'Switch'

export default Switch

