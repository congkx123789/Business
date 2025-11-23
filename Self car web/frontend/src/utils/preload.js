/**
 * Route Preloading Utilities
 * 
 * Preloads above-the-fold resources for Home and Cars pages
 * to improve perceived performance.
 */

/**
 * Preload a route module
 * @param {Function} importFn - Dynamic import function
 */
export const preloadRoute = (importFn) => {
  if (typeof importFn === 'function') {
    importFn()
  }
}

/**
 * Preload Home page resources
 * Called when user is likely to navigate to home
 */
export const preloadHome = () => {
  import('../pages/Home')
}

/**
 * Preload Cars page resources
 * Called when user is likely to navigate to cars page
 */
export const preloadCars = () => {
  import('../pages/Cars')
}

/**
 * Preload CarDetail page resources
 * Called when user hovers over car card
 */
export const preloadCarDetail = () => {
  import('../pages/CarDetail')
}

/**
 * Preload critical resources on idle
 * Uses requestIdleCallback if available
 */
export const preloadOnIdle = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload likely next routes
      preloadHome()
      preloadCars()
    }, { timeout: 2000 })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadHome()
      preloadCars()
    }, 2000)
  }
}

/**
 * Preload on link hover (FE-101)
 * @param {string} route - Route to preload
 */
export const preloadOnHover = (route) => {
  switch (route) {
    case 'home':
      preloadHome()
      break
    case 'cars':
      preloadCars()
      break
    case 'carDetail':
      preloadCarDetail()
      break
    default:
      break
  }
}

/**
 * Create hover prefetch handler for links (FE-101)
 * @param {Function} importFn - Dynamic import function
 * @param {number} delay - Delay before prefetch (ms, default: 100)
 */
export const createHoverPrefetch = (importFn, delay = 100) => {
  let timeoutId = null
  let hasPrefetched = false
  
  return {
    onMouseEnter: () => {
      if (hasPrefetched) return
      
      timeoutId = setTimeout(() => {
        if (typeof importFn === 'function') {
          importFn()
          hasPrefetched = true
        }
      }, delay)
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }
}

/**
 * Prefetch route on hover (FE-101)
 * Attach to Link components for automatic prefetching
 */
export const usePrefetchOnHover = (route) => {
  const prefetchHandlers = {
    home: () => preloadHome(),
    cars: () => preloadCars(),
    carDetail: () => preloadCarDetail(),
    booking: () => import('../pages/Booking'),
    checkout: () => import('../pages/Checkout'),
    profile: () => import('../pages/Profile'),
  }
  
  const importFn = prefetchHandlers[route]
  if (!importFn) return {}
  
  return createHoverPrefetch(importFn, 100)
}

export default {
  preloadRoute,
  preloadHome,
  preloadCars,
  preloadCarDetail,
  preloadOnIdle,
  preloadOnHover,
}

