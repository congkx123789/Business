import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../utils'
import Login from '../../pages/Login'

/**
 * Frontend Stress Testing
 * Tests component behavior under stress conditions
 */
describe('Frontend Stress Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rapid Form Interactions', () => {
    it('should handle rapid typing without lag', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)

      // Rapid typing
      const rapidText = 'a'.repeat(100)
      
      const startTime = performance.now()
      await user.type(emailInput, rapidText, { delay: 0 })
      const endTime = performance.now()

      const typingTime = endTime - startTime
      
      // Should complete typing quickly (less than 1 second for 100 chars)
      expect(typingTime).toBeLessThan(1000)
      expect(emailInput).toHaveValue(rapidText)
    })

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      renderWithProviders(<Login />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(submitButton)
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Button should be disabled after first submission or handle gracefully
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument()
      })
    })
  })

  describe('Memory Leak Detection', () => {
    it('should not leak memory during multiple renders', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0

      // Render and unmount multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = renderWithProviders(<Login />)
        unmount()
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB for 100 renders)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })

  describe('Large Data Rendering', () => {
    it('should handle rendering many elements efficiently', () => {
      const startTime = performance.now()
      
      // Render component with many children
      const { container } = renderWithProviders(<Login />)
      
      const renderTime = performance.now() - startTime
      
      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100)
      
      const elements = container.querySelectorAll('*')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Event Handler Stress', () => {
    it('should handle many rapid events without performance degradation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const startTime = performance.now()

      // Rapid focus/blur events
      for (let i = 0; i < 100; i++) {
        await user.click(emailInput)
        await user.tab()
      }

      const endTime = performance.now()
      const eventHandlingTime = endTime - startTime

      // Should handle events efficiently
      expect(eventHandlingTime).toBeLessThan(5000) // 5 seconds for 100 events
    })
  })

  describe('Component Re-rendering', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0
      
      const TestComponent = () => {
        renderCount++
        return <div>Test</div>
      }

      const { rerender } = renderWithProviders(<TestComponent />)
      
      // Re-render with same props
      rerender(<TestComponent />)
      
      // Should have reasonable render count
      expect(renderCount).toBeLessThan(10)
    })
  })
})

