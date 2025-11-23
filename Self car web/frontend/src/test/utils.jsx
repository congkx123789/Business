import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options

  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Mock user data for testing
export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'USER',
}

export const mockAdmin = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN',
}

// Mock car data for testing
export const mockCar = {
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  color: 'Blue',
  pricePerDay: 50.00,
  available: true,
  description: 'A reliable and comfortable sedan',
  images: ['car1.jpg', 'car2.jpg'],
  features: ['Air Conditioning', 'Bluetooth', 'GPS'],
}

// Mock booking data for testing
export const mockBooking = {
  id: 1,
  carId: 1,
  userId: 1,
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  totalPrice: 250.00,
  status: 'CONFIRMED',
  car: mockCar,
}

// Helper to create mock API responses
export const createMockResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
})

export * from '@testing-library/react'
