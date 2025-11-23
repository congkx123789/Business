import { Loader2 } from 'lucide-react'

/**
 * Loading Spinner Component
 * Beautiful, accessible loading indicator
 */
const LoadingSpinner = ({ size = 'lg', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[25rem] gap-4">
      <Loader2 
        className={`${sizeClasses[size]} text-primary-600 animate-spin`}
        aria-hidden="true"
      />
      <p className="text-gray-600 font-medium" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

export default LoadingSpinner

