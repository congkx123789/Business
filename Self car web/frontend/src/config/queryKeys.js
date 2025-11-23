/**
 * Standardized Query Keys Configuration
 * 
 * This file centralizes all query keys used in the application.
 * All query keys follow a consistent pattern:
 * - Domain prefix (e.g., 'cars', 'bookings', 'dashboard')
 * - Resource type (e.g., 'list', 'detail', 'user')
 * - Optional parameters/filters
 * 
 * Usage:
 * - Import query keys from this file
 * - Use queryKey factories for dynamic keys
 * - Align with backend cache keys for optimal cache efficiency
 */

/**
 * Cars Domain Query Keys
 */
export const carsQueryKeys = {
  all: ['cars'],
  lists: () => [...carsQueryKeys.all, 'list'],
  list: (params) => [...carsQueryKeys.lists(), params],
  details: () => [...carsQueryKeys.all, 'detail'],
  detail: (id) => [...carsQueryKeys.details(), id],
  available: (filters) => [...carsQueryKeys.all, 'available', filters],
  featured: () => [...carsQueryKeys.all, 'featured'],
  similar: (carId) => [...carsQueryKeys.all, 'similar', carId],
  recommendations: (userId) => [...carsQueryKeys.all, 'recommendations', userId],
}

/**
 * Bookings Domain Query Keys
 */
export const bookingsQueryKeys = {
  all: ['bookings'],
  lists: () => [...bookingsQueryKeys.all, 'list'],
  list: (filters) => [...bookingsQueryKeys.lists(), filters],
  details: () => [...bookingsQueryKeys.all, 'detail'],
  detail: (id) => [...bookingsQueryKeys.details(), id],
  user: () => [...bookingsQueryKeys.all, 'user'],
  admin: () => [...bookingsQueryKeys.all, 'admin'],
  adminList: (filters) => [...bookingsQueryKeys.admin(), 'list', filters],
  statusBreakdown: (dateRange) => [...bookingsQueryKeys.admin(), 'statusBreakdown', dateRange],
}

/**
 * Auth Domain Query Keys
 */
export const authQueryKeys = {
  all: ['auth'],
  me: () => [...authQueryKeys.all, 'me'],
  user: (id) => [...authQueryKeys.all, 'user', id],
}

/**
 * Dashboard Domain Query Keys
 */
export const dashboardQueryKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardQueryKeys.all, 'stats'],
  revenue: (period) => [...dashboardQueryKeys.all, 'revenue', period],
  revenueByDealer: (dateRange) => [...dashboardQueryKeys.all, 'revenue', 'dealer', dateRange],
  revenueByCategory: (dateRange) => [...dashboardQueryKeys.all, 'revenue', 'category', dateRange],
  revenueByLocation: (dateRange) => [...dashboardQueryKeys.all, 'revenue', 'location', dateRange],
  balanceOverview: () => [...dashboardQueryKeys.all, 'balance-overview'],
  analytics: (dateRange) => [...dashboardQueryKeys.all, 'analytics', dateRange],
  sellerScore: () => [...dashboardQueryKeys.all, 'seller-score'],
  businessInsights: () => [...dashboardQueryKeys.all, 'business-insights'],
}

/**
 * SRE/Governance Domain Query Keys
 */
export const sreQueryKeys = {
  all: ['sre'],
  slos: (period) => [...sreQueryKeys.all, 'slos', period],
  errorRates: (period) => [...sreQueryKeys.all, 'errorRates', period],
  incidents: (period) => [...sreQueryKeys.all, 'incidents', period],
  postmortems: () => [...sreQueryKeys.all, 'postmortems'],
  postmortem: (id) => [...sreQueryKeys.postmortems(), id],
}

/**
 * Cache Policies
 * Aligned with backend TTLs (see queryDefaults.js)
 */
export const cachePolicies = {
  // Static content (60 min backend)
  static: {
    staleTime: 55 * 60 * 1000, // 55 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
  
  // Semi-static content (30 min backend)
  semiStatic: {
    staleTime: 28 * 60 * 1000, // 28 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Dynamic content (15 min backend)
  dynamic: {
    staleTime: 14 * 60 * 1000, // 14 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Inventory (10 min backend)
  inventory: {
    staleTime: 9 * 60 * 1000, // 9 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  },
  
  // Real-time (5 min backend)
  realtime: {
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
}

/**
 * Query Key Usage by Domain
 */
export const queryKeyUsage = {
  cars: {
    list: cachePolicies.dynamic,
    detail: cachePolicies.dynamic, // VDP
    featured: cachePolicies.semiStatic,
    available: cachePolicies.inventory,
    similar: cachePolicies.dynamic,
    recommendations: cachePolicies.semiStatic,
  },
  bookings: {
    list: cachePolicies.realtime,
    detail: cachePolicies.realtime,
    user: cachePolicies.realtime,
    admin: cachePolicies.realtime,
  },
  dashboard: {
    stats: cachePolicies.realtime,
    revenue: cachePolicies.realtime,
    analytics: cachePolicies.realtime,
  },
  auth: {
    me: cachePolicies.semiStatic,
  },
  sre: {
    slos: cachePolicies.realtime,
    errorRates: cachePolicies.realtime,
    incidents: cachePolicies.realtime,
  },
}

export default {
  cars: carsQueryKeys,
  bookings: bookingsQueryKeys,
  auth: authQueryKeys,
  dashboard: dashboardQueryKeys,
  sre: sreQueryKeys,
  cachePolicies,
  queryKeyUsage,
}

