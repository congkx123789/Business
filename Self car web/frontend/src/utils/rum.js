/**
 * Real User Monitoring (RUM) + Sentry Integration (FE-111)
 * 
 * Comprehensive RUM implementation with:
 * - Sentry error tracking
 * - Performance monitoring
 * - Session replay
 * - User journey tracking
 */

/**
 * Initialize Sentry (FE-111)
 */
export const initSentry = async () => {
  if (typeof window === 'undefined') return
  
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
  
  if (!SENTRY_DSN) {
    console.debug('Sentry DSN not configured')
    return
  }
  
  // Dynamic import of Sentry to avoid bundle bloat if not needed
  // Only import if package is available (optional dependency)
  try {
    const sentryModule = await import('@sentry/react')
    const Sentry = sentryModule.default || sentryModule
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        // Browser tracing integration
        Sentry.browserTracingIntegration({
          // Trace 100% of transactions in production
          tracePropagationTargets: ['localhost', import.meta.env.VITE_API_BASE_URL || ''],
        }),
        // Replay integration (FE-111)
        Sentry.replayIntegration({
          maskAllText: true, // Mask sensitive data
          blockAllMedia: false,
          // Session replay sampling (10% of sessions)
          sessionSampleRate: 0.1,
          // Error replay sampling (100% of error sessions)
          errorSampleRate: 1.0,
        }),
      ],
      // Performance monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
      // Session replay
      replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0, // Always capture replays on errors
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      
      // Before send hook - filter sensitive data
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          // Remove sensitive headers
          if (event.request.headers) {
            delete event.request.headers['Authorization']
            delete event.request.headers['Cookie']
          }
          
          // Remove sensitive query params
          if (event.request.query_string) {
            const filtered = new URLSearchParams(event.request.query_string)
            filtered.delete('token')
            filtered.delete('password')
            event.request.query_string = filtered.toString()
          }
        }
        
        return event
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Network errors (handled separately)
        'NetworkError',
        'Failed to fetch',
      ],
    })
  } catch (error) {
    // Silently fail if Sentry package is not installed
    console.debug('Sentry not available (optional dependency):', error.message)
  }
}

/**
 * Capture exception in Sentry (FE-111)
 */
export const captureException = (error, context = {}) => {
  if (typeof window === 'undefined') return
  
  import('@sentry/react').then((Sentry) => {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
      tags: {
        component: context.component || 'unknown',
        page: window.location.pathname,
      },
    })
  }).catch(() => {
    // Silently fail if Sentry not available
  })
}

/**
 * Capture message in Sentry (FE-111)
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (typeof window === 'undefined') return
  
  import('@sentry/react').then((Sentry) => {
    Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context,
      },
      tags: {
        page: window.location.pathname,
      },
    })
  }).catch(() => {
    // Silently fail if Sentry not available
  })
}

/**
 * Set user context in Sentry (FE-111)
 */
export const setSentryUser = (user) => {
  if (typeof window === 'undefined') return
  
  import('@sentry/react').then((Sentry) => {
    Sentry.setUser({
      id: user.id?.toString(),
      email: user.email,
      username: user.username,
      // Don't send sensitive data
    })
  }).catch(() => {
    // Silently fail if Sentry not available
  })
}

/**
 * Clear user context in Sentry (FE-111)
 */
export const clearSentryUser = () => {
  if (typeof window === 'undefined') return
  
  import('@sentry/react').then((Sentry) => {
    Sentry.setUser(null)
  }).catch(() => {
    // Silently fail if Sentry not available
  })
}

/**
 * Add breadcrumb to Sentry (FE-111)
 */
export const addBreadcrumb = (message, category = 'default', level = 'info', data = {}) => {
  if (typeof window === 'undefined') return
  
  import('@sentry/react').then((Sentry) => {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    })
  }).catch(() => {
    // Silently fail if Sentry not available
  })
}

/**
 * RUM Performance Monitoring (FE-111)
 */
export const initRUMMonitoring = () => {
  if (typeof window === 'undefined') return
  
  // Track page load performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    if (perfData) {
      const metrics = {
        // Navigation timing
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ssl: perfData.secureConnectionStart ? perfData.connectEnd - perfData.secureConnectionStart : 0,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        domProcessing: perfData.domComplete - perfData.domInteractive,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart,
        
        // Resource timing
        resourceCount: performance.getEntriesByType('resource').length,
        resourceSize: performance.getEntriesByType('resource').reduce((sum, r) => sum + (r.transferSize || 0), 0),
      }
      
      // Send to Sentry
      addBreadcrumb('Page load performance', 'performance', 'info', metrics)
      
      // Send to backend RUM endpoint
      sendRUMMetric('page_load', metrics)
    }
  })
  
  // Track Core Web Vitals
  trackCoreWebVitals()
}

/**
 * Track Core Web Vitals (FE-111)
 */
const trackCoreWebVitals = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return
  
  // LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcp = lastEntry.renderTime || lastEntry.loadTime
      
      sendRUMMetric('lcp', { value: lcp, element: lastEntry.element?.tagName || '' })
      addBreadcrumb('LCP measured', 'web-vitals', 'info', { lcp })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    console.debug('LCP observer not supported:', e)
  }
  
  // CLS
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    
    // Send final CLS on page unload
    window.addEventListener('beforeunload', () => {
      sendRUMMetric('cls', { value: clsValue })
      addBreadcrumb('CLS measured', 'web-vitals', 'info', { cls: clsValue })
    })
  } catch (e) {
    console.debug('CLS observer not supported:', e)
  }
  
  // INP (Interaction to Next Paint)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) {
          const inp = entry.processingStart - entry.startTime
          sendRUMMetric('inp', { value: inp, interactionType: entry.name })
          addBreadcrumb('INP measured', 'web-vitals', 'info', { inp, type: entry.name })
        }
      }
    })
    inpObserver.observe({ entryTypes: ['event'] })
  } catch (e) {
    console.debug('INP observer not supported:', e)
  }
}

/**
 * Send RUM metric to backend (FE-111)
 */
const sendRUMMetric = (metricName, data) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    
    navigator.sendBeacon(
      `${API_BASE_URL}/rum/metrics`,
      JSON.stringify({
        metric: metricName,
        data,
        timestamp: Date.now(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      })
    )
  } catch (error) {
    console.debug('Failed to send RUM metric:', error)
  }
}

/**
 * Initialize RUM + Sentry (FE-111)
 */
export const initRUM = () => {
  if (typeof window === 'undefined') return
  
  // Initialize Sentry
  initSentry()
  
  // Initialize RUM monitoring
  initRUMMonitoring()
}

export default {
  initRUM,
  initSentry,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
  addBreadcrumb,
}

