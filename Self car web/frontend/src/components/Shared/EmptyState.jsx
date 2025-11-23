/**
 * EmptyState Component (FE-020, FE-021)
 * 
 * Beautiful empty state component with:
 * - Icon support (Lucide icons)
 * - Proper ARIA attributes
 * - Action buttons
 * - Consistent styling
 */

import { Button } from '../Foundation'
import iconSizes from '../../utils/iconSizes'

/**
 * EmptyState Component
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Icon component (e.g., from lucide-react)
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Optional action button/link
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div 
          className="mb-6 p-4 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary"
          aria-hidden="true"
        >
          <Icon 
            size={iconSizes.xl} 
            className="text-gray-400 dark:text-dark-text-tertiary"
          />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-base text-gray-600 dark:text-dark-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState

// Named exports for convenience (aliases to default export)
export { EmptyState }
export const EmptyCarDetail = EmptyState
export const EmptyCars = EmptyState
export const EmptyBookings = EmptyState
