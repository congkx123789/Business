import { describe, it, expect, vi } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './utils'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Home from '../pages/Home'
import Cars from '../pages/Cars'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import useAuthStore from '../store/authStore'

vi.mock('../store/authStore')

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Page Accessibility', () => {
    it('Login page has no accessibility violations', async () => {
      const { container } = renderWithProviders(<Login />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Register page has no accessibility violations', async () => {
      const { container } = renderWithProviders(<Register />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Home page has no accessibility violations', async () => {
      const { container } = renderWithProviders(<Home />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Cars page has no accessibility violations', async () => {
      const { container } = renderWithProviders(<Cars />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Component Accessibility', () => {
    it('Navbar has no accessibility violations', async () => {
      vi.mock('../store/authStore', () => ({
        default: () => ({
          isAuthenticated: false,
          user: null,
          logout: vi.fn(),
        }),
      }))

      const { container } = renderWithProviders(<Navbar />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Footer has no accessibility violations', async () => {
      const { container } = renderWithProviders(<Footer />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form Accessibility', () => {
    it('Login form has proper labels and structure', async () => {
      const { container } = renderWithProviders(<Login />)
      const results = await axe(container)
      
      expect(results).toHaveNoViolations()
      // Additional checks: email input should be associated with its label
      // Using getByLabelText is more robust than requiring aria-label
      // eslint-disable-next-line no-undef
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('Register form has proper labels and structure', async () => {
      const { container } = renderWithProviders(<Register />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
