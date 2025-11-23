import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'

/**
 * Stable query keys for auth
 */
export const authQueryKeys = {
  all: ['auth'],
  me: () => [...authQueryKeys.all, 'me'],
}

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async () => {
      const response = await authAPI.getCurrentUser()
      return response.data
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on 401
  })
}

/**
 * Hook to login
 * Uses /me endpoint to fetch complete user data (works for both classic and OAuth2)
 */
export const useLogin = () => {
  const { setAuth, fetchCurrentUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await authAPI.login(credentials)
      return response.data
    },
    onSuccess: async (data) => {
      // Set token first so /me endpoint can use it
      setAuth(data.user, data.token)
      
      // Fetch complete user data from /me endpoint
      // This ensures OAuth2 users get all fields (oauthProvider, oauthProviderId)
      const userData = await fetchCurrentUser()
      
      if (userData) {
        queryClient.setQueryData(authQueryKeys.me(), userData)
        queryClient.invalidateQueries({ queryKey: authQueryKeys.me() })
      }
    },
  })
}

/**
 * Hook to register
 * Uses /me endpoint to fetch complete user data
 */
export const useRegister = () => {
  const { setAuth, fetchCurrentUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData) => {
      const response = await authAPI.register(userData)
      return response.data
    },
    onSuccess: async (data) => {
      // Set token first so /me endpoint can use it
      setAuth(data.user, data.token)
      
      // Fetch complete user data from /me endpoint
      const userData = await fetchCurrentUser()
      
      if (userData) {
        queryClient.setQueryData(authQueryKeys.me(), userData)
        queryClient.invalidateQueries({ queryKey: authQueryKeys.me() })
      }
    },
  })
}

