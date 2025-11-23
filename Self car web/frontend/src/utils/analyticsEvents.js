/**
 * Analytics Events Catalog (FE-112)
 * 
 * Comprehensive event tracking for:
 * - Search and filter interactions
 * - PDP (Product Detail Page) media interactions
 * - CTA (Call-to-Action) clicks
 * - User journey tracking
 * - Heatmap/rage-click detection
 */

/**
 * Analytics Event Types
 */
export const AnalyticsEventType = {
  // Search & Filter
  SEARCH_QUERY: 'search_query',
  SEARCH_RESULTS: 'search_results',
  FILTER_APPLIED: 'filter_applied',
  FILTER_REMOVED: 'filter_removed',
  SORT_CHANGED: 'sort_changed',
  
  // PDP (Product Detail Page)
  PDP_VIEW: 'pdp_view',
  PDP_IMAGE_VIEW: 'pdp_image_view',
  PDP_IMAGE_ZOOM: 'pdp_image_zoom',
  PDP_GALLERY_NAVIGATE: 'pdp_gallery_navigate',
  PDP_VIDEO_PLAY: 'pdp_video_play',
  PDP_VIDEO_COMPLETE: 'pdp_video_complete',
  PDP_SPECS_EXPAND: 'pdp_specs_expand',
  PDP_SIMILAR_VIEW: 'pdp_similar_view',
  
  // CTA (Call-to-Action)
  CTA_CLICK: 'cta_click',
  CTA_BOOKING_START: 'cta_booking_start',
  CTA_LEAD_SUBMIT: 'cta_lead_submit',
  CTA_CONTACT_SELLER: 'cta_contact_seller',
  CTA_SHARE: 'cta_share',
  CTA_SAVE_SEARCH: 'cta_save_search',
  
  // User Journey
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  RAGE_CLICK: 'rage_click',
  ERROR_OCCURRED: 'error_occurred',
  
  // Conversion
  BOOKING_STARTED: 'booking_started',
  BOOKING_COMPLETED: 'booking_completed',
  LEAD_SUBMITTED: 'lead_submitted',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
}

/**
 * Send analytics event
 */
const sendAnalyticsEvent = (eventType, properties = {}) => {
  if (typeof window === 'undefined') return
  
  const event = {
    type: eventType,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
  }
  
  // Send to analytics service (Google Analytics, custom endpoint, etc.)
  if (window.gtag) {
    window.gtag('event', eventType, {
      event_category: properties.category || 'general',
      event_label: properties.label || '',
      value: properties.value || 0,
      ...properties,
    })
  }
  
  // Send to custom analytics endpoint
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    navigator.sendBeacon(
      `${API_BASE_URL}/analytics/events`,
      JSON.stringify(event)
    )
  } catch (error) {
    console.debug('Analytics event failed:', error)
  }
  
  // Log for debugging in development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', eventType, properties)
  }
}

/**
 * Track search query (FE-112)
 */
export const trackSearchQuery = (query, resultCount = 0) => {
  sendAnalyticsEvent(AnalyticsEventType.SEARCH_QUERY, {
    category: 'search',
    label: query,
    value: resultCount,
    query,
    resultCount,
  })
}

/**
 * Track search results (FE-112)
 */
export const trackSearchResults = (query, resultCount, filters = {}) => {
  sendAnalyticsEvent(AnalyticsEventType.SEARCH_RESULTS, {
    category: 'search',
    label: query,
    value: resultCount,
    query,
    resultCount,
    filters,
  })
}

/**
 * Track filter applied (FE-112)
 */
export const trackFilterApplied = (filterType, filterValue) => {
  sendAnalyticsEvent(AnalyticsEventType.FILTER_APPLIED, {
    category: 'filter',
    label: filterType,
    filterType,
    filterValue,
  })
}

/**
 * Track filter removed (FE-112)
 */
export const trackFilterRemoved = (filterType) => {
  sendAnalyticsEvent(AnalyticsEventType.FILTER_REMOVED, {
    category: 'filter',
    label: filterType,
    filterType,
  })
}

/**
 * Track sort changed (FE-112)
 */
export const trackSortChanged = (sortBy, sortDir) => {
  sendAnalyticsEvent(AnalyticsEventType.SORT_CHANGED, {
    category: 'filter',
    label: sortBy,
    sortBy,
    sortDir,
  })
}

/**
 * Track PDP view (FE-112)
 */
export const trackPDPView = (carId, carName) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_VIEW, {
    category: 'pdp',
    label: carName,
    carId,
    carName,
  })
}

/**
 * Track PDP image view (FE-112)
 */
export const trackPDPImageView = (carId, imageIndex, imageUrl) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_IMAGE_VIEW, {
    category: 'pdp_media',
    label: `Image ${imageIndex}`,
    carId,
    imageIndex,
    imageUrl,
  })
}

/**
 * Track PDP image zoom (FE-112)
 */
export const trackPDPImageZoom = (carId, imageIndex, zoomLevel) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_IMAGE_ZOOM, {
    category: 'pdp_media',
    label: `Zoom ${zoomLevel}x`,
    carId,
    imageIndex,
    zoomLevel,
  })
}

/**
 * Track PDP gallery navigation (FE-112)
 */
export const trackPDPGalleryNavigate = (carId, fromIndex, toIndex, direction) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_GALLERY_NAVIGATE, {
    category: 'pdp_media',
    label: direction,
    carId,
    fromIndex,
    toIndex,
    direction,
  })
}

/**
 * Track PDP video play (FE-112)
 */
export const trackPDPVideoPlay = (carId, videoUrl) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_VIDEO_PLAY, {
    category: 'pdp_media',
    label: 'Video play',
    carId,
    videoUrl,
  })
}

/**
 * Track PDP video complete (FE-112)
 */
export const trackPDPVideoComplete = (carId, videoUrl, duration) => {
  sendAnalyticsEvent(AnalyticsEventType.PDP_VIDEO_COMPLETE, {
    category: 'pdp_media',
    label: 'Video complete',
    carId,
    videoUrl,
    duration,
  })
}

/**
 * Track CTA click (FE-112)
 */
export const trackCTAClick = (ctaType, ctaLocation, targetId = null) => {
  sendAnalyticsEvent(AnalyticsEventType.CTA_CLICK, {
    category: 'cta',
    label: ctaType,
    ctaType,
    ctaLocation,
    targetId,
  })
}

/**
 * Track booking start (FE-112)
 */
export const trackBookingStart = (carId) => {
  sendAnalyticsEvent(AnalyticsEventType.CTA_BOOKING_START, {
    category: 'conversion',
    label: 'Booking started',
    carId,
  })
}

/**
 * Track lead submit (FE-112)
 */
export const trackLeadSubmit = (carId) => {
  sendAnalyticsEvent(AnalyticsEventType.CTA_LEAD_SUBMIT, {
    category: 'conversion',
    label: 'Lead submitted',
    carId,
  })
}

/**
 * Track contact seller (FE-112)
 */
export const trackContactSeller = (carId) => {
  sendAnalyticsEvent(AnalyticsEventType.CTA_CONTACT_SELLER, {
    category: 'conversion',
    label: 'Contact seller',
    carId,
  })
}

/**
 * Track scroll depth (FE-112)
 */
export const trackScrollDepth = (depth) => {
  sendAnalyticsEvent(AnalyticsEventType.SCROLL_DEPTH, {
    category: 'engagement',
    label: `${depth}%`,
    value: depth,
    depth,
  })
}

/**
 * Rage click detection (FE-112)
 * Detects rapid repeated clicks on the same element
 */
let rageClickTracker = {
  clicks: new Map(),
  threshold: 3, // 3 clicks in 2 seconds
  timeWindow: 2000,
}

export const trackRageClick = (elementId, elementType) => {
  const now = Date.now()
  const key = `${elementId}-${elementType}`
  
  if (!rageClickTracker.clicks.has(key)) {
    rageClickTracker.clicks.set(key, [])
  }
  
  const clicks = rageClickTracker.clicks.get(key)
  clicks.push(now)
  
  // Remove clicks outside time window
  const recentClicks = clicks.filter(
    (time) => now - time < rageClickTracker.timeWindow
  )
  rageClickTracker.clicks.set(key, recentClicks)
  
  if (recentClicks.length >= rageClickTracker.threshold) {
    sendAnalyticsEvent(AnalyticsEventType.RAGE_CLICK, {
      category: 'engagement',
      label: 'Rage click detected',
      elementId,
      elementType,
      clickCount: recentClicks.length,
    })
    
    // Clear the clicks for this element
    rageClickTracker.clicks.delete(key)
  }
}

/**
 * Initialize rage click detection (FE-112)
 */
export const initRageClickDetection = () => {
  if (typeof window === 'undefined') return
  
  document.addEventListener('click', (e) => {
    const element = e.target
    const elementId = element.id || element.getAttribute('data-element-id')
    const elementType = element.tagName.toLowerCase()
    
    if (elementId || elementType) {
      trackRageClick(elementId || element.className, elementType)
    }
  })
}

/**
 * Track page view (FE-112)
 */
export const trackPageView = (pagePath, pageTitle) => {
  sendAnalyticsEvent(AnalyticsEventType.PAGE_VIEW, {
    category: 'navigation',
    label: pageTitle || pagePath,
    pagePath,
    pageTitle,
  })
}

/**
 * Track error (FE-112)
 */
export const trackError = (errorType, errorMessage, errorStack = null) => {
  sendAnalyticsEvent(AnalyticsEventType.ERROR_OCCURRED, {
    category: 'error',
    label: errorType,
    errorType,
    errorMessage,
    errorStack: errorStack?.substring(0, 500), // Truncate stack trace
  })
}

/**
 * Initialize analytics (FE-112)
 */
export const initAnalytics = () => {
  if (typeof window === 'undefined') return
  
  // Initialize rage click detection
  initRageClickDetection()
  
  // Track page views on route changes
  trackPageView(window.location.pathname, document.title)
  
  // Track scroll depth
  let maxScroll = 0
  window.addEventListener('scroll', () => {
    const scrollDepth = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    )
    
    if (scrollDepth > maxScroll) {
      maxScroll = scrollDepth
      
      // Track milestone scroll depths (25%, 50%, 75%, 100%)
      if ([25, 50, 75, 100].includes(scrollDepth)) {
        trackScrollDepth(scrollDepth)
      }
    }
  })
}

export default {
  AnalyticsEventType,
  trackSearchQuery,
  trackSearchResults,
  trackFilterApplied,
  trackFilterRemoved,
  trackSortChanged,
  trackPDPView,
  trackPDPImageView,
  trackPDPImageZoom,
  trackPDPGalleryNavigate,
  trackPDPVideoPlay,
  trackPDPVideoComplete,
  trackCTAClick,
  trackBookingStart,
  trackLeadSubmit,
  trackContactSeller,
  trackScrollDepth,
  trackRageClick,
  trackPageView,
  trackError,
  initAnalytics,
}

