import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useAuthStore from '../authStore'

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: (fn, options) => fn
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.getState().logout()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setAuth', () => {
    it('sets user, token, and authentication status', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER'
      }
      const mockToken = 'test-jwt-token'

      act(() => {
        result.current.setAuth(mockUser, mockToken)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles admin user authentication', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockAdmin = {
        id: 2,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
      const mockToken = 'admin-jwt-token'

      act(() => {
        result.current.setAuth(mockAdmin, mockToken)
      })

      expect(result.current.user).toEqual(mockAdmin)
      expect(result.current.user.role).toBe('ADMIN')
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('overwrites previous authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Set initial auth
      const firstUser = { id: 1, email: 'first@example.com', role: 'USER' }
      const firstToken = 'first-token'
      
      act(() => {
        result.current.setAuth(firstUser, firstToken)
      })

      // Set new auth
      const secondUser = { id: 2, email: 'second@example.com', role: 'ADMIN' }
      const secondToken = 'second-token'
      
      act(() => {
        result.current.setAuth(secondUser, secondToken)
      })

      expect(result.current.user).toEqual(secondUser)
      expect(result.current.token).toBe(secondToken)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('clears all authentication data', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // First authenticate
      const mockUser = { id: 1, email: 'test@example.com' }
      const mockToken = 'test-token'
      
      act(() => {
        result.current.setAuth(mockUser, mockToken)
      })

      // Verify authentication is set
      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('works when already logged out', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Ensure we start logged out
      expect(result.current.isAuthenticated).toBe(false)

      // Call logout anyway
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('updates user data while preserving other properties', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // First authenticate
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER'
      }
      const mockToken = 'test-token'
      
      act(() => {
        result.current.setAuth(mockUser, mockToken)
      })

      // Update user data
      const updates = {
        firstName: 'Jane',
        phone: '+1-555-0123'
      }
      
      act(() => {
        result.current.updateUser(updates)
      })

      expect(result.current.user).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Jane', // Updated
        lastName: 'Doe', // Preserved
        role: 'USER', // Preserved
        phone: '+1-555-0123' // Added
      })
      expect(result.current.token).toBe(mockToken) // Unchanged
      expect(result.current.isAuthenticated).toBe(true) // Unchanged
    })

    it('handles partial user updates', () => {
      const { result } = renderHook(() => useAuthStore())
      
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
      
      act(() => {
        result.current.setAuth(mockUser, 'token')
      })

      // Update just the last name
      act(() => {
        result.current.updateUser({ lastName: 'Smith' })
      })

      expect(result.current.user.firstName).toBe('John') // Unchanged
      expect(result.current.user.lastName).toBe('Smith') // Updated
      expect(result.current.user.email).toBe('test@example.com') // Unchanged
    })

    it('works with empty updates object', () => {
      const { result } = renderHook(() => useAuthStore())
      
      const mockUser = { id: 1, email: 'test@example.com' }
      
      act(() => {
        result.current.setAuth(mockUser, 'token')
      })

      const originalUser = result.current.user

      act(() => {
        result.current.updateUser({})
      })

      expect(result.current.user).toEqual(originalUser)
    })

    it('handles null/undefined user gracefully', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Ensure user is null
      expect(result.current.user).toBeNull()

      // Try to update null user - should not throw error
      act(() => {
        result.current.updateUser({ firstName: 'Test' })
      })

      // User should now have the updated data
      expect(result.current.user).toEqual({ firstName: 'Test' })
    })
  })

  describe('Store Integration', () => {
    it('maintains state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useAuthStore())
      const { result: result2 } = renderHook(() => useAuthStore())

      const mockUser = { id: 1, email: 'test@example.com' }
      const mockToken = 'test-token'

      act(() => {
        result1.current.setAuth(mockUser, mockToken)
      })

      // Both hooks should see the same state
      expect(result1.current.isAuthenticated).toBe(true)
      expect(result2.current.isAuthenticated).toBe(true)
      expect(result1.current.user).toEqual(result2.current.user)
      expect(result1.current.token).toBe(result2.current.token)
    })

    it('updates all subscribers when state changes', () => {
      const { result: result1 } = renderHook(() => useAuthStore())
      const { result: result2 } = renderHook(() => useAuthStore())

      // Authenticate in first hook
      act(() => {
        result1.current.setAuth({ id: 1, email: 'test@example.com' }, 'token')
      })

      // Logout in second hook
      act(() => {
        result2.current.logout()
      })

      // Both hooks should reflect the logged out state
      expect(result1.current.isAuthenticated).toBe(false)
      expect(result2.current.isAuthenticated).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles setAuth with null values', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAuth(null, null)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(true) // Still true because setAuth was called
    })

    it('handles setAuth with undefined values', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAuth(undefined, undefined)
      })

      expect(result.current.user).toBeUndefined()
      expect(result.current.token).toBeUndefined()
      expect(result.current.isAuthenticated).toBe(true) // Still true because setAuth was called
    })
  })
})
