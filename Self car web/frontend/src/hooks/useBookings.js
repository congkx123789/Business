import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingAPI } from '../services/api'

/**
 * Stable query keys for bookings
 */
export const bookingQueryKeys = {
  all: ['bookings'],
  lists: () => [...bookingQueryKeys.all, 'list'],
  list: (filters) => [...bookingQueryKeys.lists(), { filters }],
  details: () => [...bookingQueryKeys.all, 'detail'],
  detail: (id) => [...bookingQueryKeys.details(), id],
  user: () => [...bookingQueryKeys.all, 'user'],
}

/**
 * Hook to fetch all bookings (admin only)
 */
export const useBookings = (filters = {}) => {
  return useQuery({
    queryKey: bookingQueryKeys.list(filters),
    queryFn: async () => {
      const response = await bookingAPI.getAllBookings()
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch user's bookings
 */
export const useUserBookings = () => {
  return useQuery({
    queryKey: bookingQueryKeys.user(),
    queryFn: async () => {
      const response = await bookingAPI.getUserBookings()
      return response.data
    },
    staleTime: 1 * 60 * 1000, // 1 minute (more dynamic)
  })
}

/**
 * Hook to fetch a single booking by ID
 */
export const useBooking = (id) => {
  return useQuery({
    queryKey: bookingQueryKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      const response = await bookingAPI.getBookingById(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a booking with optimistic updates
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingData) => {
      const response = await bookingAPI.createBooking(bookingData)
      return response.data
    },
    onMutate: async (newBooking) => {
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.user() })

      const previousBookings = queryClient.getQueryData(bookingQueryKeys.user())

      // Optimistically add booking
      queryClient.setQueryData(bookingQueryKeys.user(), (old) => {
        const tempBooking = {
          ...newBooking,
          id: Date.now(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return old ? [...old, tempBooking] : [tempBooking]
      })

      return { previousBookings }
    },
    onError: (err, newBooking, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(bookingQueryKeys.user(), context.previousBookings)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.user() })
      queryClient.setQueryData(bookingQueryKeys.detail(data.id), data)
    },
  })
}

/**
 * Hook to update booking status
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await bookingAPI.updateBookingStatus(id, status)
      return response.data
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.user() })
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.lists() })

      const previousBooking = queryClient.getQueryData(bookingQueryKeys.detail(id))
      const previousUserBookings = queryClient.getQueryData(bookingQueryKeys.user())

      // Optimistically update
      queryClient.setQueryData(bookingQueryKeys.detail(id), (old) => ({
        ...old,
        status,
        updatedAt: new Date().toISOString(),
      }))

      queryClient.setQueryData(bookingQueryKeys.user(), (old) => {
        if (!old) return old
        return old.map((booking) =>
          booking.id === id ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
        )
      })

      return { previousBooking, previousUserBookings }
    },
    onError: (err, variables, context) => {
      if (context?.previousBooking) {
        queryClient.setQueryData(bookingQueryKeys.detail(variables.id), context.previousBooking)
      }
      if (context?.previousUserBookings) {
        queryClient.setQueryData(bookingQueryKeys.user(), context.previousUserBookings)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bookingQueryKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.lists() })
    },
  })
}

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await bookingAPI.cancelBooking(id)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.user() })
      await queryClient.cancelQueries({ queryKey: bookingQueryKeys.detail(id) })

      const previousUserBookings = queryClient.getQueryData(bookingQueryKeys.user())

      // Optimistically update status to CANCELLED
      queryClient.setQueryData(bookingQueryKeys.detail(id), (old) => ({
        ...old,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      }))

      queryClient.setQueryData(bookingQueryKeys.user(), (old) => {
        if (!old) return old
        return old.map((booking) =>
          booking.id === id
            ? { ...booking, status: 'CANCELLED', updatedAt: new Date().toISOString() }
            : booking
        )
      })

      return { previousUserBookings }
    },
    onError: (err, id, context) => {
      if (context?.previousUserBookings) {
        queryClient.setQueryData(bookingQueryKeys.user(), context.previousUserBookings)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.user() })
    },
  })
}

