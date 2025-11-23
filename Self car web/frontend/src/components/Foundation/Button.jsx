import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import iconSizes from '../../utils/iconSizes'

/**
 * Button Component
 * 
 * A fully accessible button component with multiple variants and sizes.
 * Supports loading states, icons, and proper ARIA attributes.
 * 
 * Variants:
 * - primary: High-contrast primary action
 * - secondary: Secondary action with subtle styling
 * - ghost: Minimal styling for less prominent actions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.variant - 'primary' | 'secondary' | 'ghost'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.aria - ARIA attributes
 */
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  aria = {},
  as,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg dark:bg-primary-400 dark:hover:bg-primary-500 dark:active:bg-primary-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary dark:border-dark-border-default',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary dark:active:bg-dark-bg-tertiary',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[2.25rem]',
    md: 'px-4 py-2 text-base min-h-[2.75rem]',
    lg: 'px-6 py-3 text-lg min-h-[3.25rem]',
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  const isDisabled = disabled || loading
  
  const Component = as || 'button'
  const buttonProps = as ? { ...props } : { type, ...props }
  
  return (
    <Component
      ref={ref}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...aria}
      {...buttonProps}
    >
      {loading && (
        <Loader2 
          className="mr-2 animate-spin" 
          aria-hidden="true"
          size={size === 'sm' ? iconSizes.xs : size === 'md' ? iconSizes.sm : iconSizes.md}
        />
      )}
      {!loading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Component>
  )
})

Button.displayName = 'Button'

export default Button

