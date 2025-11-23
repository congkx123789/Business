import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

/**
 * Unified auth store with /me endpoint integration
 * OAuth2 and classic login use the same store and flow
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      /**
       * Set auth state (used by both classic login and OAuth2)
       * OAuth2 users have oauthProvider and oauthProviderId, but are treated identically
       */
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      /**
       * Logout - clears auth state
       */
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      /**
       * Update user data (partial update)
       */
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      /**
       * Fetch current user from /me endpoint
       * This is called after login/OAuth2 to ensure user data is up-to-date
       * Works for both classic and OAuth2 users
       */
      fetchCurrentUser: async () => {
        const { token } = get()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return null
        }

        set({ isLoading: true })
        try {
          const response = await authAPI.getCurrentUser()
          // Response can be { user: {...} } or just {...}
          const userData = response.data.user || response.data
          
          set({ 
            user: userData, 
            isAuthenticated: true,
            isLoading: false 
          })
          return userData
        } catch (error) {
          // Token invalid or expired
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          })
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore

