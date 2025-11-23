import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import Login from '../Login'
import useAuthStore from '../../store/authStore'
import { authAPI } from '../../services/api'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock auth store
vi.mock('../../store/authStore')

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Page - Integration Tests', () => {
  const mockSetAuth = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      setAuth: mockSetAuth,
      logout: vi.fn(),
    })
  })

  describe('Form Rendering', () => {
    it('renders all form elements correctly', () => {
      renderWithProviders(<Login />)

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders OAuth2 buttons', () => {
      renderWithProviders(<Login />)

      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
      expect(screen.getByText(/continue with facebook/i)).toBeInTheDocument()
    })

    it('renders register link', () => {
      renderWithProviders(<Login />)

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
      const registerLink = screen.getByRole('link', { name: /sign up/i })
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Form Validation', () => {
    it('shows validation error for empty email', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      
      // Trigger blur to validate
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for empty password', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for short password', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('successfully submits form with valid credentials', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSetAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER'
          }),
          'mock-jwt-token'
        )
      })

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('redirects admin users to admin dashboard', async () => {
      const user = userEvent.setup()
      
      // Override handler for admin login
      server.use(
        http.post('http://localhost:8080/api/auth/login', async () => {
          return HttpResponse.json({
            user: { id: 1, email: 'admin@example.com', role: 'ADMIN' },
            token: 'admin-token'
          })
        })
      )

      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
      })
    })

    it('handles login failure gracefully', async () => {
      const user = userEvent.setup()
      
      // Override to return error
      server.use(
        http.post('http://localhost:8080/api/auth/login', () => {
          return new HttpResponse(null, { status: 401 })
        })
      )

      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSetAuth).not.toHaveBeenCalled()
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Delay response to see loading state
      server.use(
        http.post('http://localhost:8080/api/auth/login', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({
            user: { id: 1, email: 'test@example.com' },
            token: 'token'
          })
        })
      )

      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password$/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'secretpassword')

      expect(passwordInput).toHaveValue('secretpassword')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('navigates to register page when clicking sign up link', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Login />)

      const registerLink = screen.getByRole('link', { name: /sign up/i })
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithProviders(<Login />)

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    })

    it('has accessible submit button', () => {
      renderWithProviders(<Login />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })
})
