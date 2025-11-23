import { AlertCircle, RefreshCw, X } from 'lucide-react'

/**
 * Payment Timeout Component
 * 
 * Timeout state for payment flow.
 * Includes retry and abandon options.
 */
const PaymentTimeout = ({ onRetry, onAbandon, retryCount }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full card bg-white border-2 border-orange-200">
        <div className="text-center mb-6">
          <AlertCircle className="mx-auto mb-4 text-orange-600" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Timeout
          </h2>
          <p className="text-gray-600 mb-4">
            The payment request timed out. This may be due to network issues or the payment gateway taking too long to respond.
          </p>
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={retryCount >= 3}
          >
            <RefreshCw size={20} />
            {retryCount >= 3 ? 'Max Retries Reached' : 'Retry Payment'}
          </button>
          
          <button
            onClick={onAbandon}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancel and Return
          </button>
        </div>
        
        {retryCount >= 3 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Maximum retry attempts reached. Please contact support or try again later.
            </p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>If this issue persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentTimeout

