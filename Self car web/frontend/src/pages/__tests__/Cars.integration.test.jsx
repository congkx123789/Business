import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import Cars from '../Cars'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Cars Page - Integration Tests', () => {
  describe('Page Rendering', () => {
    it('renders page title and description', () => {
      renderWithProviders(<Cars />)

      expect(screen.getByText('Browse Our Fleet')).toBeInTheDocument()
      expect(screen.getByText(/find the perfect car/i)).toBeInTheDocument()
    })

    it('renders filter sidebar', () => {
      renderWithProviders(<Cars />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/search by name or brand/i)).toBeInTheDocument()
    })

    it('displays loading state initially', () => {
      renderWithProviders(<Cars />)

      // Should show loader or loading indicator
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument()
    })
  })

  describe('Car List Display', () => {
    it('displays cars when loaded', async () => {
      renderWithProviders(<Cars />)

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
        expect(screen.getByText('Honda Civic')).toBeInTheDocument()
      })
    })

    it('shows car count', async () => {
      renderWithProviders(<Cars />)

      await waitFor(() => {
        expect(screen.getByText(/found 2 cars/i)).toBeInTheDocument()
      })
    })

    it('handles empty car list', async () => {
      server.use(
        http.get('http://localhost:8080/api/cars', () => {
          return HttpResponse.json({ cars: [], pagination: { total: 0 } })
        })
      )

      renderWithProviders(<Cars />)

      await waitFor(() => {
        expect(screen.getByText(/no cars found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Filter Functionality', () => {
    it('applies filters when search button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Cars />)

      const searchInput = screen.getByPlaceholderText(/search by name or brand/i)
      await user.type(searchInput, 'Toyota')

      const applyButton = screen.getByRole('button', { name: /apply filters/i })
      await user.click(applyButton)

      // Filters should be applied and cars re-fetched
      await waitFor(() => {
        expect(searchInput).toHaveValue('Toyota')
      })
    })

    it('resets filters when reset button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Cars />)

      const searchInput = screen.getByPlaceholderText(/search by name or brand/i)
      await user.type(searchInput, 'Toyota')

      const resetButton = screen.getByRole('button', { name: /reset filters/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      server.use(
        http.get('http://localhost:8080/api/cars', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      renderWithProviders(<Cars />)

      await waitFor(() => {
        expect(screen.getByText(/error loading cars/i)).toBeInTheDocument()
      })
    })
  })
})
