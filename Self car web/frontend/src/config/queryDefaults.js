/**
 * React Query Defaults Configuration
 * 
 * Aligned with backend cache TTLs for optimal cache efficiency.
 * 
 * Backend TTL Reference:
 * - Static: 60 minutes (car types, brands)
 * - Semi-static: 30 minutes (featured cars, user profiles)
 * - Dynamic: 15 minutes (carById, availableCars, carList)
 * - Inventory: 10 minutes (car availability, pricing)
 * - Real-time: 5 minutes (bookings, analytics)
 * - Search: 5 minutes (search results)
 * - VDP: 15 minutes (vehicle detail page)
 * - Session: 30 minutes
 * 
 * Frontend staleTime should be slightly less than backend TTL to ensure
 * fresh data when backend cache expires.
 */

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  // Static content (60 min backend -> 55 min frontend)
  STATIC: 55 * 60 * 1000,
  
  // Semi-static content (30 min backend -> 28 min frontend)
  SEMI_STATIC: 28 * 60 * 1000,
  
  // Dynamic content (15 min backend -> 14 min frontend)
  DYNAMIC: 14 * 60 * 1000,
  
  // Inventory (10 min backend -> 9 min frontend)
  INVENTORY: 9 * 60 * 1000,
  
  // Real-time (5 min backend -> 4 min frontend)
  REALTIME: 4 * 60 * 1000,
  
  // Search results (5 min backend -> 4 min frontend)
  SEARCH: 4 * 60 * 1000,
  
  // Vehicle detail page (15 min backend -> 14 min frontend)
  VDP: 14 * 60 * 1000,
  
  // Session (30 min backend -> 28 min frontend)
  SESSION: 28 * 60 * 1000,
}

// Garbage collection times (keep in cache longer than staleTime)
export const GC_TIMES = {
  // Static: keep in cache for 2 hours after stale
  STATIC: 2 * 60 * 60 * 1000,
  
  // Semi-static: keep in cache for 1 hour after stale
  SEMI_STATIC: 60 * 60 * 1000,
  
  // Dynamic: keep in cache for 30 minutes after stale
  DYNAMIC: 30 * 60 * 1000,
  
  // Inventory: keep in cache for 20 minutes after stale
  INVENTORY: 20 * 60 * 1000,
  
  // Real-time: keep in cache for 10 minutes after stale
  REALTIME: 10 * 60 * 1000,
  
  // Search: keep in cache for 10 minutes after stale
  SEARCH: 10 * 60 * 1000,
  
  // VDP: keep in cache for 30 minutes after stale
  VDP: 30 * 60 * 1000,
  
  // Session: keep in cache for 1 hour after stale
  SESSION: 60 * 60 * 1000,
}

/**
 * Query defaults by domain
 * These are applied to all queries using the query key prefix
 */
export const queryDefaults = {
  // Cars domain - Dynamic (15 min backend)
  cars: {
    staleTime: CACHE_TIMES.DYNAMIC,
    gcTime: GC_TIMES.DYNAMIC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  },
  
  // Individual car - VDP (15 min backend)
  car: {
    staleTime: CACHE_TIMES.VDP,
    gcTime: GC_TIMES.VDP,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Featured cars - Semi-static (30 min backend)
  featuredCars: {
    staleTime: CACHE_TIMES.SEMI_STATIC,
    gcTime: GC_TIMES.SEMI_STATIC,
    refetchOnWindowFocus: false,
  },
  
  // Car availability - Inventory (10 min backend)
  carAvailability: {
    staleTime: CACHE_TIMES.INVENTORY,
    gcTime: GC_TIMES.INVENTORY,
    refetchOnWindowFocus: false,
  },
  
  // Car search - Search (5 min backend)
  carSearch: {
    staleTime: CACHE_TIMES.SEARCH,
    gcTime: GC_TIMES.SEARCH,
    refetchOnWindowFocus: false,
  },
  
  // Bookings - Real-time (5 min backend)
  bookings: {
    staleTime: CACHE_TIMES.REALTIME,
    gcTime: GC_TIMES.REALTIME,
    refetchOnWindowFocus: true, // Bookings change frequently
    refetchOnMount: true,
  },
  
  // User profile - Semi-static (30 min backend)
  user: {
    staleTime: CACHE_TIMES.SEMI_STATIC,
    gcTime: GC_TIMES.SEMI_STATIC,
    refetchOnWindowFocus: false,
  },
  
  // Dashboard - Real-time (5 min backend)
  dashboard: {
    staleTime: CACHE_TIMES.REALTIME,
    gcTime: GC_TIMES.REALTIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  
  // Analytics - Real-time (5 min backend)
  analytics: {
    staleTime: CACHE_TIMES.REALTIME,
    gcTime: GC_TIMES.REALTIME,
    refetchOnWindowFocus: true,
  },
  
  // Static data (car types, brands) - Static (60 min backend)
  static: {
    staleTime: CACHE_TIMES.STATIC,
    gcTime: GC_TIMES.STATIC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
}

/**
 * SWR (Stale-While-Revalidate) pattern configuration
 * Prefetch data when user is likely to need it
 */
export const SWR_CONFIG = {
  // Prefetch cars when hovering over "Cars" link
  cars: {
    prefetchOnHover: true,
    prefetchOnMount: true,
  },
  
  // Prefetch featured cars on home page mount
  featuredCars: {
    prefetchOnMount: true,
  },
  
  // Prefetch user bookings on profile page mount
  userBookings: {
    prefetchOnMount: true,
  },
}

export default {
  CACHE_TIMES,
  GC_TIMES,
  queryDefaults,
  SWR_CONFIG,
}

