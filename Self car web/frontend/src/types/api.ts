/**
 * API Contract Types
 * Single source of truth for all API request/response types
 * Aligned with backend DTOs and controllers
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// ============================================================================
// Auth Types
// ============================================================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: UserRole
  oauthProvider?: string | null // google, github, facebook, local
  oauthProviderId?: string | null // Provider's user ID
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserDTO
}

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: UserRole
  oauthProvider?: string | null
  oauthProviderId?: string | null
}

// ============================================================================
// Car Types
// ============================================================================

export enum CarType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  SPORTS = 'SPORTS',
  LUXURY = 'LUXURY',
  VAN = 'VAN',
}

export enum Transmission {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export interface Car {
  id: number
  name: string
  brand: string
  type: CarType
  year: number
  pricePerDay: number | string // BigDecimal as string or number
  seats: number
  transmission: Transmission
  fuelType: FuelType
  description?: string | null
  imageUrl?: string | null
  shop?: Shop | null
  images?: CarImage[]
  skus?: CarSKU[]
  available: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface CarImage {
  id: number
  url: string
  carId: number
}

export interface CarSKU {
  id: number
  sku: string
  carId: number
}

export interface Shop {
  id: number
  name: string
  ownerId: number
}

// ============================================================================
// Booking Types
// ============================================================================

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface BookingRequest {
  carId: number
  startDate: string // ISO date string (YYYY-MM-DD)
  endDate: string // ISO date string (YYYY-MM-DD)
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number | string // BigDecimal as string or number
}

export interface Booking {
  id: number
  user: User
  car: Car
  startDate: string // ISO date string (YYYY-MM-DD)
  endDate: string // ISO date string (YYYY-MM-DD)
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number | string // BigDecimal as string or number
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

// ============================================================================
// API Endpoint Paths
// ============================================================================

export const API_PATHS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  // Cars
  CARS: {
    BASE: '/api/cars',
    BY_ID: (id: number) => `/api/cars/${id}`,
    AVAILABLE: '/api/cars/available',
    FEATURED: '/api/cars/featured',
    TOGGLE_AVAILABILITY: (id: number) => `/api/cars/${id}/toggle-availability`,
  },
  // Bookings
  BOOKINGS: {
    BASE: '/api/bookings',
    BY_ID: (id: number) => `/api/bookings/${id}`,
    USER: '/api/bookings/user',
    UPDATE_STATUS: (id: number) => `/api/bookings/${id}/status`,
  },
  // Dashboard
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    REVENUE: '/api/dashboard/revenue',
    REVENUE_BY_DEALER: '/api/dashboard/revenue/dealer',
    REVENUE_BY_CATEGORY: '/api/dashboard/revenue/category',
    REVENUE_BY_LOCATION: '/api/dashboard/revenue/location',
    BALANCE_OVERVIEW: '/api/dashboard/balance-overview',
    ANALYTICS: '/api/dashboard/analytics',
    SELLER_SCORE: '/api/dashboard/seller-score',
    BUSINESS_INSIGHTS: '/api/dashboard/business-insights',
  },
} as const

// ============================================================================
// Analytics Types
// ============================================================================

export enum BadgeLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export interface SellerScoreDTO {
  sellerId: number
  sellerName: string
  shopId: number
  shopName: string
  totalScore: number | string
  badgeLevel: BadgeLevel
  isTopVerified: boolean
  isVerifiedDealer: boolean
  responseTimeScore: number | string
  completionRateScore: number | string
  ratingScore: number | string
  onTimeDeliveryScore: number | string
  customerSatisfactionScore: number | string
  avgResponseTimeHours: number | string
  totalOrders: number
  completedOrders: number
  completionRate: number | string
  avgRating: number | string
  totalReviews: number
  onTimeDeliveryRate: number | string
}

export interface BusinessInsightsDTO {
  totalRevenue: number | string
  totalOrders: number
  avgOrderValue: number | string
  conversionRate: number | string
  topPerformingCars: Array<{
    carId: number
    carName: string
    bookingsCount: number
    revenue: number | string
  }>
  recentTrends: Array<{
    period: string
    revenue: number | string
    orders: number
  }>
}

