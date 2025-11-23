import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCar } from '../hooks/useCars'
import { useCreateBooking } from '../hooks/useBookings'
import { usePaymentTelemetry } from '../hooks/usePaymentTelemetry'
import toast from 'react-hot-toast'
import { AlertCircle, CreditCard, Loader, RefreshCw, X, CheckCircle, Shield, Lock, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '../utils/localeFormatting'
import { Spinner, PageSkeleton } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import PaymentError from '../components/Payment/PaymentError'
import PaymentTimeout from '../components/Payment/PaymentTimeout'
import HostedCheckout from '../components/Payment/HostedCheckout'
import HostedFieldsFallback from '../components/Payment/HostedFieldsFallback'
import { initPaymentPageMonitoring } from '../utils/paymentMonitoring'

/**
 * Checkout Page - PCI-Aligned Payment Flow
 * 
 * Features:
 * - Redirect-first hosted checkout as default
 * - Hosted Fields fallback with strict CSP
 * - Comprehensive error/timeout states
 * - Retry/abandon flows
 * - Client telemetry
 */
const Checkout = () => {
  const { bookingId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['checkout', 'common'])
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('hosted') // 'hosted' | 'hosted-fields'
  const [paymentState, setPaymentState] = useState('idle') // 'idle' | 'processing' | 'success' | 'error' | 'timeout' | 'abandoned'
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [timeoutId, setTimeoutId] = useState(null)
  const [sessionTimer, setSessionTimer] = useState(900) // 15 minutes in seconds
  const [showTimerWarning, setShowTimerWarning] = useState(false)
  
  // Booking data from URL params
  const carId = searchParams.get('carId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const totalPrice = parseFloat(searchParams.get('totalPrice') || '0')
  
  const { data: car, isLoading: carLoading, error: carError } = useCar(carId)
  const createBooking = useCreateBooking()
  const { trackPaymentEvent, trackPaymentError, trackPaymentTimeout } = usePaymentTelemetry()
  
  // Initialize payment page monitoring
  useEffect(() => {
    initPaymentPageMonitoring()
    trackPaymentEvent('checkout_page_viewed', { bookingId, carId, totalPrice })
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [bookingId, carId, totalPrice])

  // Session timer (15 minutes) - FE-081
  useEffect(() => {
    if (paymentState === 'idle' || paymentState === 'processing') {
      const timer = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 0) {
            setPaymentState('timeout')
            trackPaymentTimeout({ bookingId, carId, totalPrice, reason: 'session_expired' })
            return 0
          }
          
          // Show warning at 5 minutes remaining
          if (prev === 300 && !showTimerWarning) {
            setShowTimerWarning(true)
            toast.warning('Your session will expire in 5 minutes. Please complete your payment soon.')
          }
          
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [paymentState, bookingId, carId, totalPrice, showTimerWarning])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Payment timeout (30 seconds)
  useEffect(() => {
    if (paymentState === 'processing') {
      const timeout = setTimeout(() => {
        setPaymentState('timeout')
        trackPaymentTimeout({ bookingId, carId, totalPrice, retryCount })
        clearTimeout(timeout)
      }, 30000) // 30 seconds
      
      setTimeoutId(timeout)
      
      return () => {
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    }
  }, [paymentState, bookingId, carId, totalPrice, retryCount])
  
  // Handle payment success
  const handlePaymentSuccess = useCallback(async (paymentIntentId) => {
    try {
      setPaymentState('processing')
      
      // Create booking with payment confirmation
      const bookingData = {
        carId: parseInt(carId),
        startDate,
        endDate,
        totalPrice,
        paymentIntentId,
      }
      
      await createBooking.mutateAsync(bookingData)
      
      setPaymentState('success')
      trackPaymentEvent('payment_success', { bookingId, carId, totalPrice, paymentIntentId })
      
      toast.success('Payment successful! Booking confirmed.')
      
      // Redirect to confirmation page
      setTimeout(() => {
        navigate(`/booking/confirmation/${createBooking.data?.id || bookingId}`)
      }, 2000)
    } catch (error) {
      handlePaymentError(error)
    }
  }, [carId, startDate, endDate, totalPrice, bookingId, createBooking, navigate])
  
  // Handle payment error
  const handlePaymentError = useCallback((error) => {
    setPaymentState('error')
    setError(error)
    trackPaymentError({ 
      bookingId, 
      carId, 
      totalPrice, 
      error: error.message || 'Payment failed',
      retryCount 
    })
    
    toast.error(error.message || 'Payment failed. Please try again.')
  }, [bookingId, carId, totalPrice, retryCount])
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    setPaymentState('idle')
    setError(null)
    trackPaymentEvent('payment_retry', { bookingId, carId, totalPrice, retryCount: retryCount + 1 })
  }, [bookingId, carId, totalPrice, retryCount])
  
  // Handle abandon
  const handleAbandon = useCallback(() => {
    setPaymentState('abandoned')
    trackPaymentEvent('payment_abandoned', { bookingId, carId, totalPrice, retryCount })
    navigate('/cars')
  }, [bookingId, carId, totalPrice, retryCount, navigate])
  
  // Switch to hosted fields fallback
  const switchToHostedFields = useCallback(() => {
    setPaymentMethod('hosted-fields')
    trackPaymentEvent('payment_method_switched', { 
      bookingId, 
      carId, 
      from: 'hosted', 
      to: 'hosted-fields' 
    })
  }, [bookingId, carId])
  
  if (carLoading) {
    return <PageSkeleton />
  }
  
  if (carError || !car) {
    return (
      <ErrorState
        title="Car not found"
        message={carError?.response?.data?.message || carError?.message || 'The car you\'re looking for doesn\'t exist.'}
        showHomeButton
      />
    )
  }
  
  // Payment timeout state
  if (paymentState === 'timeout') {
    return (
      <PaymentTimeout
        onRetry={handleRetry}
        onAbandon={handleAbandon}
        retryCount={retryCount}
      />
    )
  }
  
  // Payment success state
  if (paymentState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full card text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your booking has been confirmed. Redirecting...</p>
          <div className="flex justify-center">
            <Spinner size={32} />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleAbandon}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
              <span>Cancel</span>
            </button>
            {/* Session Timer */}
            {(paymentState === 'idle' || paymentState === 'processing') && (
              <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                sessionTimer <= 300 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-dark-bg-tertiary dark:text-dark-text-secondary'
              }`}>
                <Clock size={16} />
                <span>Session expires in: {formatTimer(sessionTimer)}</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('checkout:completePayment', 'Complete Payment')}
          </h1>
          <p className="text-gray-600">
            {t('checkout:securePaymentMessage', 'Secure payment processing with PCI-compliant hosted checkout')}
          </p>
        </div>
        
        {/* Booking Summary */}
        <div className="card mb-6 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout:car', 'Car')}:</span>
              <span className="font-semibold">{car.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout:dates', 'Dates')}:</span>
              <span className="font-semibold">
                {startDate && formatDate(new Date(startDate), { month: 'short', day: 'numeric' })} - {endDate && formatDate(new Date(endDate), { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200">
              <span className="text-lg font-bold">{t('checkout:total', 'Total')}:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Payment Error */}
        {paymentState === 'error' && error && (
          <PaymentError
            error={error}
            onRetry={handleRetry}
            onAbandon={handleAbandon}
            retryCount={retryCount}
          />
        )}
        
        {/* Payment Method Selection */}
        {paymentState === 'idle' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
            </div>
            
            {paymentMethod === 'hosted' ? (
              <HostedCheckout
                amount={totalPrice}
                bookingId={bookingId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onFallback={switchToHostedFields}
              />
            ) : (
              <HostedFieldsFallback
                amount={totalPrice}
                bookingId={bookingId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        )}
        
        {/* Processing State */}
        {paymentState === 'processing' && (
          <div className="card text-center">
            <Loader className="mx-auto mb-4 text-primary-600 animate-spin" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        )}
        
        {/* Enhanced Security Notice - Phase 9: Transactional trust */}
        <div className="mt-6 card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 rounded-full p-3">
                <Shield className="text-blue-600" size={28} />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-lg">
                <Lock size={18} className="text-blue-700" />
                Your Payment is Protected
              </p>
              <p className="text-sm text-blue-800 mb-3">
                Your payment is processed securely through our PCI-compliant payment gateway. 
                We never see or store your full card details. All transactions are encrypted with 256-bit SSL.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span>PCI DSS Level 1 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span>Fraud Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

