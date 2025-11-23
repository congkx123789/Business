import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import Home from '../Home'

describe('Home Page - Integration Tests', () => {
  describe('Page Structure', () => {
    it('renders hero section with heading', () => {
      renderWithProviders(<Home />)

      expect(screen.getByText('Rent Your Perfect Car Today')).toBeInTheDocument()
      expect(screen.getByText(/experience premium car rental/i)).toBeInTheDocument()
    })

    it('renders CTA buttons in hero section', () => {
      renderWithProviders(<Home />)

      const browseCarsLink = screen.getByRole('link', { name: /browse cars/i })
      const signUpLink = screen.getByRole('link', { name: /sign up now/i })

      expect(browseCarsLink).toHaveAttribute('href', '/cars')
      expect(signUpLink).toHaveAttribute('href', '/register')
    })

    it('renders features section', () => {
      renderWithProviders(<Home />)

      expect(screen.getByText('Why Choose SelfCar?')).toBeInTheDocument()
      expect(screen.getByText('Wide Selection')).toBeInTheDocument()
      expect(screen.getByText('Fully Insured')).toBeInTheDocument()
      expect(screen.getByText('24/7 Support')).toBeInTheDocument()
      expect(screen.getByText('Best Prices')).toBeInTheDocument()
    })

    it('renders statistics section', () => {
      renderWithProviders(<Home />)

      expect(screen.getByText('500+')).toBeInTheDocument()
      expect(screen.getByText('Vehicles')).toBeInTheDocument()
      expect(screen.getByText('10K+')).toBeInTheDocument()
      expect(screen.getByText('Happy Customers')).toBeInTheDocument()
    })

    it('renders CTA section', () => {
      renderWithProviders(<Home />)

      expect(screen.getByText('Ready to Start Your Journey?')).toBeInTheDocument()
      const viewAllCarsLink = screen.getByRole('link', { name: /view all cars/i })
      expect(viewAllCarsLink).toHaveAttribute('href', '/cars')
    })
  })

  describe('Navigation Links', () => {
    it('all navigation links have correct hrefs', () => {
      renderWithProviders(<Home />)

      const links = screen.getAllByRole('link')
      const carsLinks = links.filter(link => link.textContent?.includes('Cars'))
      
      carsLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/cars')
      })
    })
  })
})
