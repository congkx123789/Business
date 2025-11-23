import { useQuery } from '@tanstack/react-query'
import { carAPI } from '../services/api'
import { carsQueryKeys, queryKeyUsage } from '../config/queryKeys'

/**
 * Hook to fetch similar cars (bonus feature)
 * Uses backend recommendations API
 */
export const useSimilarCars = (carId, options = {}) => {
  return useQuery({
    queryKey: carsQueryKeys.similar(carId),
    queryFn: async () => {
      if (!carId) return []
      
      // In production, call dedicated similar cars endpoint
      // For now, fetch cars with similar attributes
      try {
        // This would be: carAPI.getSimilarCars(carId)
        // For now, return empty array (backend implementation needed)
        const response = await carAPI.getAllCars({ 
          limit: 4, // Show 4 similar cars
          excludeId: carId,
        })
        
        return Array.isArray(response.data) 
          ? response.data.slice(0, 4)
          : (response.data.content || []).slice(0, 4)
      } catch (error) {
        console.error('Error fetching similar cars:', error)
        return []
      }
    },
    enabled: !!carId && options.enabled !== false,
    // Use centralized cache policy
    ...queryKeyUsage.cars.similar,
  })
}

/**
 * Hook to fetch personalized recommendations (bonus feature)
 * Uses backend recommendations API
 */
export const useRecommendations = (userId, options = {}) => {
  return useQuery({
    queryKey: carsQueryKeys.recommendations(userId),
    queryFn: async () => {
      if (!userId) return []
      
      // In production, call dedicated recommendations endpoint
      // For now, fetch featured cars
      try {
        // This would be: carAPI.getRecommendations(userId)
        const response = await carAPI.getAllCars({ 
          featured: true,
          limit: 8,
        })
        
        return Array.isArray(response.data) 
          ? response.data.slice(0, 8)
          : (response.data.content || []).slice(0, 8)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        return []
      }
    },
    enabled: !!userId && options.enabled !== false,
    // Use centralized cache policy
    ...queryKeyUsage.cars.recommendations,
  })
}

export default {
  useSimilarCars,
  useRecommendations,
}

