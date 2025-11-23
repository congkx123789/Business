import { AlertCircle, RefreshCw, X } from 'lucide-react'

/**
 * Payment Error Component
 * 
 * Comprehensive error states for payment flow.
 * Includes retry and abandon options.
 */
const PaymentError = ({ error, onRetry, onAbandon, retryCount }) => {
  const getErrorMessage = () => {
    if (error?.message) {
      return error.message
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    
    return 'Payment failed. Please try again.'
  }
  
  const getErrorTitle = () => {
    if (error?.code === 'card_declined') {
      return 'Card Declined'
    }
    if (error?.code === 'insufficient_funds') {
      return 'Insufficient Funds'
    }
    if (error?.code === 'expired_card') {
      return 'Expired Card'
    }
    if (error?.code === 'network_error') {
      return 'Network Error'
    }
    
    return 'Payment Error'
  }
  
  return (
    <div className="card bg-red-50 border-2 border-red-200 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="text-red-600" size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-red-800 mb-4">
            {getErrorMessage()}
          </p>
          
          {retryCount > 0 && (
            <p className="text-sm text-red-700 mb-4">
              Retry attempt: {retryCount}
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="btn-primary flex items-center gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw size={18} />
              {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
            </button>
            
            <button
              onClick={onAbandon}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel Payment
            </button>
          </div>
          
          {retryCount >= 3 && (
            <p className="text-sm text-red-700 mt-4">
              Maximum retry attempts reached. Please contact support or try a different payment method.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentError

