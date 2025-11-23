import { forwardRef } from 'react'

/**
 * Radio Component
 * 
 * A fully accessible radio button component with proper ARIA attributes.
 * Should be used within a RadioGroup for proper grouping.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Radio ID (auto-generated if not provided)
 * @param {string} props.name - Radio group name (required)
 * @param {string} props.value - Radio value
 * @param {boolean} props.checked - Checked state
 * @param {boolean} props.disabled - Disable radio
 * @param {string} props.className - Additional CSS classes
 */
export const Radio = forwardRef(({
  label,
  id,
  name,
  value,
  checked,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-4 h-4 border-2 text-primary-500 focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
  
  const stateClasses = checked
    ? 'border-primary-500 dark:border-primary-400'
    : 'border-gray-300 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary'
  
  const radioClasses = `${baseClasses} ${stateClasses} ${className}`
  
  return (
    <div className="flex items-center">
      <input
        ref={ref}
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        className={radioClasses}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
      {label && (
        <label
          htmlFor={radioId}
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

Radio.displayName = 'Radio'

/**
 * RadioGroup Component
 * 
 * Groups radio buttons together with proper ARIA attributes.
 * 
 * @param {Object} props
 * @param {string} props.label - Group label (required for accessibility)
 * @param {string} props.name - Radio group name (required)
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.orientation - 'horizontal' | 'vertical'
 */
export const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  orientation = 'vertical',
  className = '',
  ...props
}) => {
  const groupId = `radiogroup-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className}
      {...props}
    >
      {label && (
        <legend className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
          {label}
        </legend>
      )}
      <div className={orientation === 'horizontal' ? 'flex gap-4' : 'flex flex-col gap-2'}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return (
            <Radio
              key={optionValue}
              name={name}
              value={optionValue}
              label={optionLabel}
              checked={value === optionValue}
              onChange={onChange}
            />
          )
        })}
      </div>
    </div>
  )
}

RadioGroup.displayName = 'RadioGroup'

export default Radio

