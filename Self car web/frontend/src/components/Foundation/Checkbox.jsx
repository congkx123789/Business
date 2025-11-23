import { forwardRef } from 'react'

/**
 * Checkbox Component
 * 
 * A fully accessible checkbox component with proper ARIA attributes.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Checkbox ID (auto-generated if not provided)
 * @param {boolean} props.checked - Checked state
 * @param {boolean} props.indeterminate - Indeterminate state (partial check)
 * @param {boolean} props.disabled - Disable checkbox
 * @param {string} props.className - Additional CSS classes
 */
export const Checkbox = forwardRef(({
  label,
  id,
  checked,
  indeterminate,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-4 h-4 rounded border-2 text-primary-500 focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
  
  const stateClasses = checked || indeterminate
    ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400'
    : 'bg-white border-gray-300 dark:bg-dark-bg-secondary dark:border-dark-border-default'
  
  const checkboxClasses = `${baseClasses} ${stateClasses} ${className}`
  
  return (
    <div className="flex items-center">
      <input
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(node)
            } else {
              ref.current = node
            }
          }
          if (node && indeterminate !== undefined) {
            node.indeterminate = indeterminate
          }
        }}
        id={checkboxId}
        type="checkbox"
        className={checkboxClasses}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        aria-checked={indeterminate ? 'mixed' : checked}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={`ml-3 text-sm font-medium text-gray-700 dark:text-dark-text-primary ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {label}
        </label>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox

