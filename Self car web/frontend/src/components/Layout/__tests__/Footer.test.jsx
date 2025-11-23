import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders company branding correctly', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText('SelfCar')).toBeInTheDocument()
    expect(screen.getByText(/premium car rental service/i)).toBeInTheDocument()
  })

  it('renders quick links section with correct navigation', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    
    const browseCarsLink = screen.getByRole('link', { name: /browse cars/i })
    expect(browseCarsLink).toBeInTheDocument()
    expect(browseCarsLink).toHaveAttribute('href', '/cars')

    const aboutLink = screen.getByRole('link', { name: /about us/i })
    expect(aboutLink).toBeInTheDocument()
    expect(aboutLink).toHaveAttribute('href', '/about')

    const contactLink = screen.getByRole('link', { name: /contact/i })
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', '/contact')

    const termsLink = screen.getByRole('link', { name: /terms & conditions/i })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms')
  })

  it('renders contact information correctly', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText('info@selfcar.com')).toBeInTheDocument()
    expect(screen.getByText('123 Car Street, NY 10001')).toBeInTheDocument()
  })

  it('renders social media section', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText('Follow Us')).toBeInTheDocument()
    
    // Check for social media links (they all have href="#" in the current implementation)
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href') === '#'
    )
    expect(socialLinks).toHaveLength(3) // Facebook, Twitter, Instagram
  })

  it('displays current year in copyright', () => {
    renderWithProviders(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear} SelfCar. All rights reserved.`))).toBeInTheDocument()
  })

  it('has proper structure with all sections', () => {
    renderWithProviders(<Footer />)

    // Verify main sections are present
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByText('Follow Us')).toBeInTheDocument()
  })

  it('contains accessible contact information with icons', () => {
    renderWithProviders(<Footer />)

    // Check that contact info is properly structured
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText('info@selfcar.com')).toBeInTheDocument()
    expect(screen.getByText('123 Car Street, NY 10001')).toBeInTheDocument()
  })

  it('has company logo in footer', () => {
    renderWithProviders(<Footer />)

    // Check for the logo element (looking for the "S" in the logo)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('SelfCar')).toBeInTheDocument()
  })

  describe('responsive grid layout', () => {
    it('renders all grid sections', () => {
      renderWithProviders(<Footer />)

      // All four main sections should be present
      expect(screen.getByText(/premium car rental service/i)).toBeInTheDocument() // Company info
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()
      expect(screen.getByText('Follow Us')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithProviders(<Footer />)

      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings).toHaveLength(3) // Quick Links, Contact Us, Follow Us
    })

    it('has meaningful link text', () => {
      renderWithProviders(<Footer />)

      expect(screen.getByRole('link', { name: /browse cars/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /terms & conditions/i })).toBeInTheDocument()
    })
  })
})
