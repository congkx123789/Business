/**
 * Metrics Collection Utility - Phase 10
 * 
 * Collects Core Web Vitals and custom metrics for observability
 * Integrates with Micrometer/Prometheus endpoints
 * 
 * SLOs (Service Level Objectives):
 * - LCP (Largest Contentful Paint) < 2.5s on 75% mobile
 * - CLS (Cumulative Layout Shift) < 0.1
 * - FID (First Input Delay) < 100ms
 * - TTFB (Time to First Byte) aligned with SSR/edge strategy
 * - Search latency < 500ms
 * - PDP latency < 800ms
 */

// Metrics endpoint (aligned with backend Micrometer)
const METRICS_ENDPOINT = import.meta.env.VITE_METRICS_ENDPOINT || '/api/metrics'
const PROMETHEUS_ENDPOINT = import.meta.env.VITE_PROMETHEUS_ENDPOINT || '/api/actuator/prometheus'

/**
 * Send metric to backend
 */
const sendMetric = async (metricName, value, labels = {}) => {
  try {
    // In production, send to Micrometer/Prometheus endpoint
    if (typeof window === 'undefined') return
    
    const payload = {
      name: metricName,
      value,
      labels: {
        ...labels,
        page: window.location.pathname,
        timestamp: Date.now(),
      },
    }
    
    // Send to backend metrics endpoint
    fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // Send even if page is unloading
    }).catch(() => {
      // Silently fail - metrics are non-critical
    })
  } catch (error) {
    // Silently fail - metrics are non-critical
    console.debug('Metrics collection error:', error)
  }
}

/**
 * Core Web Vitals Collection
 */
export const collectCoreWebVitals = () => {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        const lcp = lastEntry.renderTime || lastEntry.loadTime
        sendMetric('web_vitals_lcp', lcp, {
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        })
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.debug('LCP observer error:', error)
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        sendMetric('web_vitals_cls', clsValue, {
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      
      // Send final CLS on page unload
      window.addEventListener('beforeunload', () => {
        sendMetric('web_vitals_cls_final', clsValue)
      })
    } catch (error) {
      console.debug('CLS observer error:', error)
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
          sendMetric('web_vitals_fid', fid, {
            device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          })
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.debug('FID observer error:', error)
    }

    // Time to First Byte (TTFB)
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const ttfb = entry.responseStart - entry.requestStart
            sendMetric('web_vitals_ttfb', ttfb, {
              device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            })
          }
        }
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.debug('TTFB observer error:', error)
    }
  }
}

/**
 * Track search latency
 */
export const trackSearchLatency = (query, duration) => {
  sendMetric('search_latency', duration, {
    query: query.substring(0, 50), // Truncate long queries
    hasResults: true, // Will be updated based on results
  })
}

/**
 * Track PDP (Product Detail Page) latency
 */
export const trackPDPLatency = (carId, duration) => {
  sendMetric('pdp_latency', duration, {
    carId: carId.toString(),
  })
}

/**
 * Track API request latency
 */
export const trackAPIRequest = (endpoint, method, duration, status) => {
  sendMetric('api_request_duration', duration, {
    endpoint: endpoint.substring(0, 100),
    method,
    status: status.toString(),
  })
}

/**
 * Track error rate
 */
export const trackError = (errorType, errorMessage, context = {}) => {
  sendMetric('error_rate', 1, {
    errorType,
    errorMessage: errorMessage.substring(0, 100),
    ...context,
  })
}

/**
 * Track user action (for conversion funnel)
 */
export const trackUserAction = (action, metadata = {}) => {
  sendMetric('user_action', 1, {
    action,
    ...metadata,
  })
}

/**
 * Track PDP (Product Detail Page) events
 */
export const trackPDPEvent = (eventName, metadata = {}) => {
  sendMetric('pdp_event', 1, {
    event: eventName,
    ...metadata,
  })
  // Also track as user action for funnel analysis
  trackUserAction(`pdp_${eventName}`, metadata)
}

/**
 * Initialize metrics collection
 */
export const initMetrics = () => {
  if (typeof window === 'undefined') return
  
  // Collect Core Web Vitals
  collectCoreWebVitals()
  
  // Track page load performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart
      sendMetric('page_load_time', loadTime, {
        page: window.location.pathname,
      })
    }
  })
}

export default {
  collectCoreWebVitals,
  trackSearchLatency,
  trackPDPLatency,
  trackAPIRequest,
  trackError,
  trackUserAction,
  initMetrics,
}

