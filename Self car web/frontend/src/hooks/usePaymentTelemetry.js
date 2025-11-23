import { useCallback } from 'react'

/**
 * Payment Telemetry Hook
 * 
 * Client telemetry for payment flows to support postmortems and SLO reviews.
 * Tracks payment events, errors, and timeouts.
 */
export const usePaymentTelemetry = () => {
  const trackPaymentEvent = useCallback((eventName, eventData = {}) => {
    const event = {
      name: eventName,
      category: 'payment',
      timestamp: new Date().toISOString(),
      data: {
        ...eventData,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      },
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.info('[Payment Telemetry]', eventName, eventData)
    }
    
    // In production, send to backend telemetry endpoint
    if (import.meta.env.PROD) {
      fetch('/api/telemetry/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        keepalive: true, // Ensure request completes even if page unloads
      }).catch(error => {
        console.error('Failed to send payment telemetry:', error)
      })
    } else {
      // In development, still send to backend if available
      fetch('/api/telemetry/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {
        // Ignore errors in development
      })
    }
  }, [])
  
  const trackPaymentError = useCallback((errorData = {}) => {
    trackPaymentEvent('payment_error', {
      ...errorData,
      errorType: errorData.error?.type || 'unknown',
      errorMessage: errorData.error?.message || 'Unknown error',
    })
  }, [trackPaymentEvent])
  
  const trackPaymentTimeout = useCallback((timeoutData = {}) => {
    trackPaymentEvent('payment_timeout', {
      ...timeoutData,
      timeoutDuration: 30000, // 30 seconds
    })
  }, [trackPaymentEvent])
  
  const trackPaymentAbandon = useCallback((abandonData = {}) => {
    trackPaymentEvent('payment_abandoned', {
      ...abandonData,
      abandonedAt: new Date().toISOString(),
    })
  }, [trackPaymentEvent])
  
  return {
    trackPaymentEvent,
    trackPaymentError,
    trackPaymentTimeout,
    trackPaymentAbandon,
  }
}

export default usePaymentTelemetry

