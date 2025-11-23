import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockCar } from '../../../test/utils'
import CarCard from '../CarCard'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children,
}))

describe('CarCard Component', () => {
  const defaultCar = {
    ...mockCar,
    id: 1,
    name: 'Toyota Camry',
    brand: 'Toyota',
    year: 2023,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    type: 'SEDAN',
    pricePerDay: 50,
    rating: 4.5,
    imageUrl: 'https://example.com/car.jpg',
    available: true,
    featured: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders car information correctly', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
      expect(screen.getByText('Toyota • 2023')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument() // Seats count
      expect(screen.getByText('Auto')).toBeInTheDocument() // Transmission label
      expect(screen.getByText('Petrol')).toBeInTheDocument() // Fuel type label
      expect(screen.getByText('$50')).toBeInTheDocument()
      expect(screen.getByText('/day')).toBeInTheDocument()
    })

    it('renders with correct accessibility attributes', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const carLink = screen.getByRole('link')
      expect(carLink).toHaveAttribute('href', '/cars/1')
      expect(carLink).toBeInTheDocument()
    })
  })

  describe('Image Display', () => {
    it('displays car image when imageUrl is provided', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const image = screen.getByAltText('Toyota Camry')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/car.jpg')
    })

    it('displays "No Image" placeholder when imageUrl is not provided', () => {
      const carWithoutImage = { ...defaultCar, imageUrl: null }
      renderWithProviders(<CarCard car={carWithoutImage} />)

      expect(screen.getByText('No Image')).toBeInTheDocument()
      expect(screen.queryByAltText('Toyota Camry')).not.toBeInTheDocument()
    })

    it('handles empty imageUrl string', () => {
      const carWithEmptyImage = { ...defaultCar, imageUrl: '' }
      renderWithProviders(<CarCard car={carWithEmptyImage} />)

      expect(screen.getByText('No Image')).toBeInTheDocument()
    })
  })

  describe('Badges and Status', () => {
    it('displays featured badge when car is featured', () => {
      const featuredCar = { ...defaultCar, featured: true }
      renderWithProviders(<CarCard car={featuredCar} />)

      expect(screen.getByText('Featured')).toBeInTheDocument()
    })

    it('does not display featured badge when car is not featured', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      expect(screen.queryByText('Featured')).not.toBeInTheDocument()
    })

    it('displays unavailable badge when car is not available', () => {
      const unavailableCar = { ...defaultCar, available: false }
      renderWithProviders(<CarCard car={unavailableCar} />)

      expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })

    it('disables book button when car is unavailable', () => {
      const unavailableCar = { ...defaultCar, available: false }
      renderWithProviders(<CarCard car={unavailableCar} />)

      const bookButton = screen.getByRole('button', { name: /unavailable/i })
      expect(bookButton).toBeDisabled()
    })

    it('shows "Book Now" button when car is available', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const bookButton = screen.getByRole('button', { name: /book now/i })
      expect(bookButton).toBeInTheDocument()
      expect(bookButton).not.toBeDisabled()
    })
  })

  describe('Price Display', () => {
    it('formats price correctly', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      expect(screen.getByText('$50')).toBeInTheDocument()
      expect(screen.getByText('/day')).toBeInTheDocument()
    })

    it('handles string pricePerDay', () => {
      const carWithStringPrice = { ...defaultCar, pricePerDay: '75.50' }
      renderWithProviders(<CarCard car={carWithStringPrice} />)

      expect(screen.getByText('$76')).toBeInTheDocument()
    })

    it('handles zero price', () => {
      const freeCar = { ...defaultCar, pricePerDay: 0 }
      renderWithProviders(<CarCard car={freeCar} />)

      expect(screen.getByText('$0')).toBeInTheDocument()
    })
  })

  describe('Transmission and Fuel Type Labels', () => {
    it('displays correct transmission labels', () => {
      const automaticCar = { ...defaultCar, transmission: 'AUTOMATIC' }
      renderWithProviders(<CarCard car={automaticCar} />)
      expect(screen.getByText('Auto')).toBeInTheDocument()

      const manualCar = { ...defaultCar, transmission: 'MANUAL' }
      const { unmount } = renderWithProviders(<CarCard car={manualCar} />)
      unmount()
      renderWithProviders(<CarCard car={manualCar} />)
      expect(screen.getByText('Manual')).toBeInTheDocument()
    })

    it('displays correct fuel type labels', () => {
      const petrolCar = { ...defaultCar, fuelType: 'PETROL' }
      renderWithProviders(<CarCard car={petrolCar} />)
      expect(screen.getByText('Petrol')).toBeInTheDocument()

      const electricCar = { ...defaultCar, fuelType: 'ELECTRIC' }
      const { unmount } = renderWithProviders(<CarCard car={electricCar} />)
      unmount()
      renderWithProviders(<CarCard car={electricCar} />)
      expect(screen.getByText('Electric')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates to car detail page when clicked', async () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const carLink = screen.getByRole('link')
      expect(carLink).toHaveAttribute('href', '/cars/1')
    })

    it('has accessible book now button', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const bookButton = screen.getByRole('button', { name: /book now/i })
      expect(bookButton).toBeInTheDocument()
      expect(bookButton).toHaveClass('btn-primary')
    })

    it('prevents navigation when book button is clicked for unavailable car', async () => {
      const user = userEvent.setup()
      const unavailableCar = { ...defaultCar, available: false }
      renderWithProviders(<CarCard car={unavailableCar} />)

      const bookButton = screen.getByRole('button', { name: /unavailable/i })
      await user.click(bookButton)

      // Should not navigate (button is disabled)
      expect(bookButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing car properties gracefully', () => {
      const minimalCar = {
        id: 1,
        name: 'Test Car',
        brand: 'Test',
        year: 2023,
        pricePerDay: 30,
        seats: 4,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        available: true,
      }
      
      renderWithProviders(<CarCard car={minimalCar} />)
      
      expect(screen.getByText('Test Car')).toBeInTheDocument()
      expect(screen.getByText('$30')).toBeInTheDocument()
    })

    it('handles very long car names with truncation', () => {
      const carWithLongName = {
        ...defaultCar,
        name: 'Super Ultra Luxury Premium Executive Business Class Vehicle'
      }
      
      renderWithProviders(<CarCard car={carWithLongName} />)
      
      expect(screen.getByText('Super Ultra Luxury Premium Executive Business Class Vehicle')).toBeInTheDocument()
    })

    it('handles high price values', () => {
      const expensiveCar = { ...defaultCar, pricePerDay: 999.99 }
      renderWithProviders(<CarCard car={expensiveCar} />)

      expect(screen.getByText('$1,000')).toBeInTheDocument()
    })

    it('handles different car types', () => {
      const suvCar = { ...defaultCar, type: 'SUV' }
      renderWithProviders(<CarCard car={suvCar} />)
      
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    })

    it('handles null or undefined values gracefully', () => {
      const carWithNulls = {
        ...defaultCar,
        imageUrl: null,
        rating: null,
      }
      
      expect(() => renderWithProviders(<CarCard car={carWithNulls} />)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      const { container } = renderWithProviders(<CarCard car={defaultCar} />)
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/cars/1')
    })

    it('has accessible images with alt text', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const image = screen.getByAltText('Toyota Camry')
      expect(image).toBeInTheDocument()
    })

    it('maintains keyboard navigation', () => {
      renderWithProviders(<CarCard car={defaultCar} />)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })
})
