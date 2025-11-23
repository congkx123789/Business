/**
 * Performance Metrics Collector
 * Collects LCP, TTFB, CLS, INP, cache hit rates, and API latencies
 * Sends metrics to backend for aggregation and analysis
 */

const METRICS_ENDPOINT = '/api/metrics/performance'

/**
 * Collect and send Web Vitals metrics
 */
export const initMetricsCollection = () => {
  if (typeof window === 'undefined') return

  // Collect LCP (Largest Contentful Paint)
  collectLCP()
  
  // Collect TTFB (Time to First Byte)
  collectTTFB()
  
  // Collect CLS (Cumulative Layout Shift)
  collectCLS()
  
  // Collect INP (Interaction to Next Paint) - replaces FID
  collectINP()
  
  // Collect cache hit rates
  collectCacheMetrics()
  
  // Collect API latencies
  collectAPIMetrics()
}

/**
 * Collect Largest Contentful Paint (LCP)
 */
const collectLCP = () => {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      const lcp = {
        value: lastEntry.renderTime || lastEntry.loadTime,
        url: lastEntry.url || '',
        element: lastEntry.element?.tagName || '',
        timestamp: Date.now(),
        metric: 'LCP'
      }
      
      sendMetric(lcp)
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    console.warn('LCP observer not supported:', e)
  }
}

/**
 * Collect Time to First Byte (TTFB)
 */
const collectTTFB = () => {
  if (!window.performance || !window.performance.timing) return

  window.addEventListener('load', () => {
    const timing = window.performance.timing
    const ttfb = timing.responseStart - timing.navigationStart
    
    sendMetric({
      value: ttfb,
      timestamp: Date.now(),
      metric: 'TTFB',
      url: window.location.href
    })
  })
}

/**
 * Collect Cumulative Layout Shift (CLS)
 */
const collectCLS = () => {
  if (!('PerformanceObserver' in window)) return

  try {
    let clsValue = 0
    let clsEntries = []
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          clsEntries.push({
            value: entry.value,
            sources: entry.sources?.map(s => ({
              node: s.node?.tagName || '',
              previousRect: s.previousRect,
              currentRect: s.currentRect
            })) || []
          })
        }
      })
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
    
    // Send final CLS value on page unload
    window.addEventListener('pagehide', () => {
      sendMetric({
        value: clsValue,
        entries: clsEntries,
        timestamp: Date.now(),
        metric: 'CLS',
        url: window.location.href
      })
    })
  } catch (e) {
    console.warn('CLS observer not supported:', e)
  }
}

/**
 * Collect Interaction to Next Paint (INP)
 */
const collectINP = () => {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const inp = {
          value: entry.processingStart - entry.startTime,
          duration: entry.duration,
          interactionType: entry.name,
          timestamp: Date.now(),
          metric: 'INP',
          url: window.location.href
        }
        
        sendMetric(inp)
      })
    })
    
    observer.observe({ entryTypes: ['event'] })
  } catch (e) {
    console.warn('INP observer not supported:', e)
  }
}

/**
 * Collect cache hit rates (browser cache, CDN cache)
 */
const collectCacheMetrics = () => {
  if (!window.performance || !window.performance.getEntriesByType) return

  window.addEventListener('load', () => {
    const resources = window.performance.getEntriesByType('resource')
    const imageResources = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i))
    
    let browserCacheHits = 0
    let browserCacheMisses = 0
    let cdnCacheHits = 0
    let cdnCacheMisses = 0
    
    imageResources.forEach(resource => {
      // Check browser cache (transferSize === 0 indicates cache hit)
      const isBrowserCacheHit = resource.transferSize === 0
      if (isBrowserCacheHit) {
        browserCacheHits++
      } else {
        browserCacheMisses++
      }
      
      // Check CDN cache (via response headers)
      // Note: This is approximate - actual CDN cache status would come from response headers
      const isCDN = resource.name.includes('cloudfront') || 
                    resource.name.includes('cdn') || 
                    resource.name.includes('amazonaws')
      
      if (isCDN) {
        // Approximate: if transferSize is small relative to decodedBodySize, likely cached
        const isLikelyCDNCache = resource.transferSize < resource.decodedBodySize * 0.5
        if (isLikelyCDNCache) {
          cdnCacheHits++
        } else {
          cdnCacheMisses++
        }
      }
    })
    
    const totalImages = imageResources.length
    const browserCacheHitRate = totalImages > 0 ? (browserCacheHits / totalImages) * 100 : 0
    const cdnCacheHitRate = (cdnCacheHits + cdnCacheMisses) > 0 
      ? (cdnCacheHits / (cdnCacheHits + cdnCacheMisses)) * 100 
      : 0
    
    sendMetric({
      metric: 'CACHE_HIT_RATE',
      browserCacheHits,
      browserCacheMisses,
      browserCacheHitRate,
      cdnCacheHits,
      cdnCacheMisses,
      cdnCacheHitRate,
      totalImages,
      timestamp: Date.now(),
      url: window.location.href
    })
  })
}

/**
 * Collect API latencies
 */
const collectAPIMetrics = () => {
  if (!window.performance || !window.performance.getEntriesByType) return

  // Intercept fetch requests
  const originalFetch = window.fetch
  window.fetch = async function(...args) {
    const startTime = performance.now()
    const url = args[0]
    
    try {
      const response = await originalFetch.apply(this, args)
      const endTime = performance.now()
      const latency = endTime - startTime
      
      // Only track API calls (not static assets)
      if (typeof url === 'string' && (url.includes('/api/') || url.includes('api'))) {
        sendMetric({
          metric: 'API_LATENCY',
          value: latency,
          url: url,
          method: args[1]?.method || 'GET',
          status: response.status,
          timestamp: Date.now()
        })
      }
      
      return response
    } catch (error) {
      const endTime = performance.now()
      const latency = endTime - startTime
      
      sendMetric({
        metric: 'API_LATENCY',
        value: latency,
        url: url,
        method: args[1]?.method || 'GET',
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      })
      
      throw error
    }
  }
  
  // Also track XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open
  const originalSend = XMLHttpRequest.prototype.send
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._metricStartTime = performance.now()
    this._metricUrl = url
    this._metricMethod = method
    return originalOpen.apply(this, [method, url, ...rest])
  }
  
  XMLHttpRequest.prototype.send = function(...args) {
    const xhr = this
    
    const onLoadEnd = () => {
      const latency = performance.now() - xhr._metricStartTime
      
      if (xhr._metricUrl && (xhr._metricUrl.includes('/api/') || xhr._metricUrl.includes('api'))) {
        sendMetric({
          metric: 'API_LATENCY',
          value: latency,
          url: xhr._metricUrl,
          method: xhr._metricMethod,
          status: xhr.status,
          timestamp: Date.now()
        })
      }
    }
    
    xhr.addEventListener('loadend', onLoadEnd)
    return originalSend.apply(this, args)
  }
}

/**
 * Send metric to backend
 */
const sendMetric = async (metric) => {
  try {
    // Batch metrics and send periodically to reduce overhead
    if (!window._metricsBuffer) {
      window._metricsBuffer = []
    }
    
    window._metricsBuffer.push(metric)
    
    // Send batch every 5 seconds or when buffer reaches 10 items
    if (!window._metricsTimer) {
      window._metricsTimer = setInterval(() => {
        flushMetrics()
      }, 5000)
    }
    
    if (window._metricsBuffer.length >= 10) {
      flushMetrics()
    }
  } catch (error) {
    console.warn('Failed to queue metric:', error)
  }
}

/**
 * Flush metrics buffer to backend
 */
const flushMetrics = async () => {
  if (!window._metricsBuffer || window._metricsBuffer.length === 0) {
    return
  }
  
  const metricsToSend = [...window._metricsBuffer]
  window._metricsBuffer = []
  
  try {
    const response = await fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: metricsToSend,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }),
      // Don't track this request itself
      keepalive: true
    })
    
    if (!response.ok) {
      console.warn('Failed to send metrics:', response.status)
    }
  } catch (error) {
    console.warn('Failed to send metrics:', error)
    // Re-add metrics to buffer for retry (limit to prevent memory issues)
    if (window._metricsBuffer.length < 50) {
      window._metricsBuffer.unshift(...metricsToSend)
    }
  }
}

/**
 * Send metrics on page unload
 */
window.addEventListener('beforeunload', () => {
  if (window._metricsBuffer && window._metricsBuffer.length > 0) {
    // Use sendBeacon for reliable delivery on page unload
    const data = JSON.stringify({
      metrics: window._metricsBuffer,
      page: window.location.pathname
    })
    
    navigator.sendBeacon(METRICS_ENDPOINT, data)
  }
  
  if (window._metricsTimer) {
    clearInterval(window._metricsTimer)
  }
})

export default {
  initMetricsCollection
}

