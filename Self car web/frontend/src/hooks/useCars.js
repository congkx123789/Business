import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carAPI } from '../services/api'
import { API_PATHS } from '../types/api'
import { carsQueryKeys, cachePolicies, queryKeyUsage } from '../config/queryKeys'

/**
 * Use centralized query keys from queryKeys.js
 * This ensures consistent cache key structure across the app
 */
export const carQueryKeys = carsQueryKeys

/**
 * Hook to fetch all cars with optional filters, pagination, and sorting
 * @param {Object} options - Query options
 * @param {Object} options.filters - Filter parameters
 * @param {number} options.page - Page number (0-indexed)
 * @param {number} options.pageSize - Items per page
 * @param {string} options.sortBy - Column to sort by
 * @param {string} options.sortDir - Sort direction ('asc' or 'desc')
 */
export const useCars = (options = {}) => {
  const { filters = {}, page = 0, pageSize = 10, sortBy, sortDir } = options
  
  const params = {
    ...filters,
    page,
    size: pageSize,
  }
  
  if (sortBy) {
    params.sort = sortBy
    params.sortDir = sortDir || 'asc'
  }
  
  return useQuery({
    queryKey: carQueryKeys.list(params),
    queryFn: async () => {
      const response = await carAPI.getAllCars(params)
      // Handle both paginated and non-paginated responses
      if (response.data.content) {
        // Paginated response
        return {
          content: response.data.content,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          page: response.data.page || page,
          size: response.data.size || pageSize,
        }
      }
      // Non-paginated response (backward compatibility)
      return {
        content: Array.isArray(response.data) ? response.data : response.data.cars || [],
        totalElements: Array.isArray(response.data) ? response.data.length : (response.data.total || 0),
        totalPages: 1,
        page: 0,
        size: Array.isArray(response.data) ? response.data.length : pageSize,
      }
    },
    // Use centralized cache policies aligned with backend TTLs
    ...queryKeyUsage.cars.list,
  })
}

/**
 * Hook to fetch a single car by ID
 */
export const useCar = (id) => {
  return useQuery({
    queryKey: carQueryKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      const response = await carAPI.getCarById(id)
      return response.data
    },
    enabled: !!id,
    // Use centralized cache policy for VDP (Vehicle Detail Page)
    ...queryKeyUsage.cars.detail,
  })
}

/**
 * Hook to fetch available cars
 */
export const useAvailableCars = (startDate, endDate) => {
  return useQuery({
    queryKey: carQueryKeys.available({ startDate, endDate }),
    queryFn: async () => {
      const response = await carAPI.getAvailableCars(startDate, endDate)
      return response.data
    },
    enabled: !!(startDate && endDate),
    // Use inventory cache policy (most dynamic)
    ...queryKeyUsage.cars.available,
  })
}

/**
 * Hook to fetch featured cars
 */
export const useFeaturedCars = () => {
  return useQuery({
    queryKey: carQueryKeys.featured(),
    queryFn: async () => {
      // Note: API might need this endpoint
      const response = await carAPI.getAllCars({ featured: true })
      return response.data
    },
    // Use semi-static cache policy (featured cars change less frequently)
    ...queryKeyUsage.cars.featured,
  })
}

/**
 * Hook to create a car with optimistic updates
 */
export const useCreateCar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (carData) => {
      const response = await carAPI.createCar(carData)
      return response.data
    },
    onMutate: async (newCar) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: carQueryKeys.lists() })

      // Snapshot previous value
      const previousCars = queryClient.getQueryData(carQueryKeys.lists())

      // Optimistically update
      queryClient.setQueryData(carQueryKeys.lists(), (old) => {
        const tempCar = {
          ...newCar,
          id: Date.now(), // Temporary ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return old ? [...old, tempCar] : [tempCar]
      })

      return { previousCars }
    },
    onError: (err, newCar, context) => {
      // Rollback on error
      if (context?.previousCars) {
        queryClient.setQueryData(carQueryKeys.lists(), context.previousCars)
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() })
      queryClient.setQueryData(carQueryKeys.detail(data.id), data)
    },
  })
}

/**
 * Hook to update a car with optimistic updates
 */
export const useUpdateCar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, carData }) => {
      const response = await carAPI.updateCar(id, carData)
      return response.data
    },
    onMutate: async ({ id, carData }) => {
      await queryClient.cancelQueries({ queryKey: carQueryKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: carQueryKeys.lists() })

      const previousCar = queryClient.getQueryData(carQueryKeys.detail(id))
      const previousCars = queryClient.getQueryData(carQueryKeys.lists())

      // Optimistically update single car
      queryClient.setQueryData(carQueryKeys.detail(id), (old) => ({
        ...old,
        ...carData,
        updatedAt: new Date().toISOString(),
      }))

      // Optimistically update list
      queryClient.setQueryData(carQueryKeys.lists(), (old) => {
        if (!old) return old
        return old.map((car) =>
          car.id === id ? { ...car, ...carData, updatedAt: new Date().toISOString() } : car
        )
      })

      return { previousCar, previousCars }
    },
    onError: (err, variables, context) => {
      if (context?.previousCar) {
        queryClient.setQueryData(carQueryKeys.detail(variables.id), context.previousCar)
      }
      if (context?.previousCars) {
        queryClient.setQueryData(carQueryKeys.lists(), context.previousCars)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(carQueryKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() })
    },
  })
}

/**
 * Hook to delete a car with optimistic updates
 */
export const useDeleteCar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await carAPI.deleteCar(id)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: carQueryKeys.lists() })
      await queryClient.cancelQueries({ queryKey: carQueryKeys.detail(id) })

      const previousCars = queryClient.getQueryData(carQueryKeys.lists())

      // Optimistically remove from list
      queryClient.setQueryData(carQueryKeys.lists(), (old) => {
        if (!old) return old
        return old.filter((car) => car.id !== id)
      })

      // Remove from cache
      queryClient.removeQueries({ queryKey: carQueryKeys.detail(id) })

      return { previousCars }
    },
    onError: (err, id, context) => {
      if (context?.previousCars) {
        queryClient.setQueryData(carQueryKeys.lists(), context.previousCars)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() })
    },
  })
}

/**
 * Hook for bulk toggle car availability
 */
export const useBulkToggleAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, available }) => {
      const response = await carAPI.bulkToggleAvailability(ids, available)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() })
    },
  })
}

/**
 * Hook to toggle car availability
 */
export const useToggleCarAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await carAPI.toggleAvailability(id)
      return response.data
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: carQueryKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: carQueryKeys.lists() })

      const previousCar = queryClient.getQueryData(carQueryKeys.detail(id))
      const previousCars = queryClient.getQueryData(carQueryKeys.lists())

      // Optimistically toggle with undefined guard
      queryClient.setQueryData(carQueryKeys.detail(id), (old) => (
        old ? { ...old, available: !old.available } : old
      ))

      queryClient.setQueryData(carQueryKeys.lists(), (old) => {
        if (!old) return old
        return old.map((car) =>
          car.id === id ? { ...car, available: !car.available } : car
        )
      })

      return { previousCar, previousCars }
    },
    onError: (err, id, context) => {
      if (context?.previousCar) {
        queryClient.setQueryData(carQueryKeys.detail(id), context.previousCar)
      }
      if (context?.previousCars) {
        queryClient.setQueryData(carQueryKeys.lists(), context.previousCars)
      }
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(carQueryKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() })
    },
  })
}

