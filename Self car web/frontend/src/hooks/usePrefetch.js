import { useQueryClient } from '@tanstack/react-query'
import { carsQueryKeys, bookingsQueryKeys, queryKeyUsage } from '../config/queryKeys'
import { carAPI } from '../services/api'

/**
 * Prefetching Hooks for High-Hit Data
 * 
 * Implements SWR (Stale-While-Revalidate) patterns:
 * - Prefetch data when user is likely to need it
 * - Prefetch on hover (link hover)
 * - Prefetch on mount (page load)
 * - Prefetch on route change anticipation
 */

/**
 * Prefetch cars list (high-hit data)
 * Called when user hovers over "Cars" link or navigates to cars page
 */
export const usePrefetchCars = () => {
  const queryClient = useQueryClient()

  const prefetchCars = async (filters = {}) => {
    await queryClient.prefetchQuery({
      queryKey: carsQueryKeys.list(filters),
      queryFn: async () => {
        const response = await carAPI.getAllCars(filters)
        if (response.data.content) {
          return {
            content: response.data.content,
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0,
            page: response.data.page || 0,
            size: response.data.size || 10,
          }
        }
        return {
          content: Array.isArray(response.data) ? response.data : response.data.cars || [],
          totalElements: Array.isArray(response.data) ? response.data.length : (response.data.total || 0),
          totalPages: 1,
          page: 0,
          size: Array.isArray(response.data) ? response.data.length : 10,
        }
      },
      // Use centralized cache policy
      ...queryKeyUsage.cars.list,
    })
  }

  return { prefetchCars }
}

/**
 * Prefetch featured cars (shown on home page)
 */
export const usePrefetchFeaturedCars = () => {
  const queryClient = useQueryClient()

  const prefetchFeaturedCars = async () => {
    await queryClient.prefetchQuery({
      queryKey: carsQueryKeys.featured(),
      queryFn: async () => {
        const response = await carAPI.getAllCars({ featured: true })
        return response.data
      },
      // Use centralized cache policy
      ...queryKeyUsage.cars.featured,
    })
  }

  return { prefetchFeaturedCars }
}

/**
 * Prefetch individual car detail (VDP)
 * Called when user hovers over car card
 */
export const usePrefetchCar = () => {
  const queryClient = useQueryClient()

  const prefetchCar = async (carId) => {
    if (!carId) return

    await queryClient.prefetchQuery({
      queryKey: carsQueryKeys.detail(carId),
      queryFn: async () => {
        const response = await carAPI.getCarById(carId)
        return response.data
      },
      // Use centralized cache policy for VDP
      ...queryKeyUsage.cars.detail,
    })
  }

  return { prefetchCar }
}

/**
 * Prefetch user bookings
 * Called when user navigates to profile page
 */
export const usePrefetchUserBookings = () => {
  const queryClient = useQueryClient()

  const prefetchUserBookings = async () => {
    // Only prefetch if user is authenticated
    const authStore = await import('../store/authStore').then(m => m.default)
    const { isAuthenticated } = authStore.getState()
    
    if (!isAuthenticated) return

    await queryClient.prefetchQuery({
      queryKey: bookingsQueryKeys.user(),
      queryFn: async () => {
        const { bookingAPI } = await import('../services/api')
        const response = await bookingAPI.getUserBookings()
        return response.data
      },
      // Use centralized cache policy
      ...queryKeyUsage.bookings.user,
    })
  }

  return { prefetchUserBookings }
}

/**
 * Prefetch on link hover
 * Hook to attach to navigation links
 */
export const usePrefetchOnHover = () => {
  const { prefetchCars } = usePrefetchCars()
  const { prefetchCar } = usePrefetchCar()

  const handleLinkHover = (linkType, params = {}) => {
    switch (linkType) {
      case 'cars':
        prefetchCars(params.filters || {})
        break
      case 'car':
        prefetchCar(params.carId)
        break
      default:
        break
    }
  }

  return { handleLinkHover }
}

export default {
  usePrefetchCars,
  usePrefetchFeaturedCars,
  usePrefetchCar,
  usePrefetchUserBookings,
  usePrefetchOnHover,
}

