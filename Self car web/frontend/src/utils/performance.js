/**
 * Performance Utilities
 * Web Vitals monitoring and performance tracking
 */

/**
 * Measure and log Web Vitals
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  // Measure Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
      
      // Log to analytics service in production
      if (import.meta.env.PROD) {
        // Example: logToAnalytics('LCP', lastEntry.renderTime || lastEntry.loadTime)
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    console.warn('LCP observer not supported:', e)
  }

  // Measure First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
        
        if (import.meta.env.PROD) {
          // logToAnalytics('FID', entry.processingStart - entry.startTime)
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    console.warn('FID observer not supported:', e)
  }

  // Measure Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
      
      if (import.meta.env.PROD) {
        // logToAnalytics('CLS', clsValue)
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    console.warn('CLS observer not supported:', e)
  }

  // Measure Time to Interactive (TTI)
  try {
    const ttiObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.duration) {
          console.log('TTI:', entry.duration)
          
          if (import.meta.env.PROD) {
            // logToAnalytics('TTI', entry.duration)
          }
        }
      })
    })
    ttiObserver.observe({ entryTypes: ['measure'] })
  } catch (e) {
    console.warn('TTI observer not supported:', e)
  }
}

/**
 * Measure page load time
 */
export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart
    
    console.log('Page Load Time:', pageLoadTime, 'ms')
    console.log('DOM Content Loaded:', domContentLoaded, 'ms')
    
    if (import.meta.env.PROD) {
      // logToAnalytics('page_load', pageLoadTime)
      // logToAnalytics('dom_content_loaded', domContentLoaded)
    }
  })
}

/**
 * Measure API query latency
 */
export const measureQueryLatency = (queryKey, startTime) => {
  const latency = Date.now() - startTime
  console.log(`Query ${queryKey} latency:`, latency, 'ms')
  
  if (import.meta.env.PROD) {
    // logToAnalytics('query_latency', { queryKey, latency })
  }
  
  return latency
}

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return
  
  measureWebVitals()
  measurePageLoad()
}

export default {
  measureWebVitals,
  measurePageLoad,
  measureQueryLatency,
  initPerformanceMonitoring,
}

