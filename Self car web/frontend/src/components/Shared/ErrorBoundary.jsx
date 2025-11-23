import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '../Foundation'
import { motion } from 'framer-motion'
import { captureException } from '../../utils/rum'

/**
 * ErrorBoundary Component (FE-082)
 * 
 * Comprehensive error boundary with:
 * - Retry patterns
 * - Friendly error messages
 * - Recovery options
 * - Error reporting
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Send error to Sentry (FE-111)
    captureException(error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack?.substring(0, 500),
    })

    // Send error to monitoring service (FE-082)
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.toString(),
          fatal: false,
          errorInfo: errorInfo.componentStack?.substring(0, 100),
        })
      }

      // Send to backend metrics endpoint
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
        fetch(`${API_BASE_URL}/metrics/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.toString(),
            errorInfo: errorInfo.componentStack,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        }).catch(() => {
          // Silently fail - error reporting is non-critical
        })
      } catch (e) {
        // Ignore errors in error reporting
      }
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state
    const { maxRetries = 3, onRetry } = this.props

    if (retryCount < maxRetries) {
      this.setState({
        isRetrying: true,
        retryCount: retryCount + 1,
      })

      // Call custom retry handler if provided
      if (onRetry) {
        onRetry(retryCount + 1)
      }

      // Wait a bit before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRetrying: false,
        })
      }, delay)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    })
  }

  render() {
    const { hasError, error, errorInfo, retryCount, isRetrying } = this.state
    const { children, fallback, maxRetries = 3 } = this.props

    if (hasError) {
      // Custom fallback component
      if (fallback) {
        return fallback({ error, errorInfo, retryCount, onRetry: this.handleRetry, onReset: this.handleReset })
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full card text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-600 dark:text-red-400" size={40} />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              We're sorry, but something unexpected happened. Don't worry, we've been notified and are working on it.
            </p>

            {error && (
              <details className="mb-6 text-left bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-gray-600 dark:text-dark-text-tertiary overflow-auto">
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {retryCount < maxRetries && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={isRetrying ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="flex-shrink-0"
                >
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Home size={18} />}
                onClick={() => window.location.href = '/'}
                className="flex-shrink-0"
              >
                Go Home
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={this.handleReset}
                className="flex-shrink-0"
              >
                Reset
              </Button>
            </div>

            {retryCount >= maxRetries && (
              <p className="mt-4 text-sm text-gray-500 dark:text-dark-text-tertiary">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
            )}
          </motion.div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
