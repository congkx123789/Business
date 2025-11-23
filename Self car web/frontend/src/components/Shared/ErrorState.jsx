import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * ErrorState - Beautiful error display component
 */
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content.',
  onRetry,
  showHomeButton = false,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50" />
            <div className="relative bg-red-50 dark:bg-red-900/30 rounded-full p-6">
              <AlertCircle className="text-red-600 dark:text-red-400" size={64} />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-8">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {showHomeButton && (
            <Link
              to="/"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Go Home
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * InlineError - Small inline error display
 */
export const InlineError = ({ message, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 text-red-600 dark:text-red-400 text-sm ${className}`}
    >
      <AlertCircle size={16} />
      <span>{message}</span>
    </motion.div>
  )
}

export default ErrorState

