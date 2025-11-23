import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 * 
 * Tests for all key pages: Login, Register, Home, Cars
 * These tests capture screenshots and compare them against baseline images.
 * 
 * To update baselines:
 * npx playwright test --update-snapshots
 * 
 * To run visual tests:
 * npx playwright test --project=chromium visual-regression
 */

test.describe('Visual Regression - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    // Wait for animations to complete
    await page.waitForTimeout(500)
  })

  test('login page visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login form with errors visual snapshot', async ({ page }) => {
    // Trigger validation errors
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await submitButton.click()
    await page.waitForTimeout(300) // Wait for error messages

    await expect(page).toHaveScreenshot('login-form-with-errors.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login form filled visual snapshot', async ({ page }) => {
    const emailInput = page.getByLabelText(/email address/i)
    const passwordInput = page.getByLabelText(/^password$/i)

    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('login-form-filled.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('register page visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('register form with errors visual snapshot', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /create account|sign up/i })
    await submitButton.click()
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('register-form-with-errors.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('register form filled visual snapshot', async ({ page }) => {
    await page.getByLabelText(/first name/i).fill('John')
    await page.getByLabelText(/last name/i).fill('Doe')
    await page.getByLabelText(/email address/i).fill('john@example.com')
    await page.getByLabelText(/phone|phone number/i).fill('+1234567890')
    await page.getByLabelText(/^password$/i).fill('password123')
    await page.getByLabelText(/confirm password/i).fill('password123')
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('register-form-filled.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('register form password mismatch visual snapshot', async ({ page }) => {
    await page.getByLabelText(/^password$/i).fill('password123')
    await page.getByLabelText(/confirm password/i).fill('differentpassword')
    await page.getByLabelText(/confirm password/i).blur()
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('register-form-password-mismatch.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('home page hero section visual snapshot', async ({ page }) => {
    // Capture hero section only
    const heroSection = page.locator('section').first()
    await expect(heroSection).toHaveScreenshot('home-hero-section.png', {
      animations: 'disabled',
    })
  })

  test('home page full page visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page features section visual snapshot', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => {
      window.scrollTo(0, 600)
    })
    await page.waitForTimeout(500)

    const featuresSection = page.locator('section').nth(1)
    await expect(featuresSection).toHaveScreenshot('home-features-section.png', {
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Cars Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for cars to load
  })

  test('cars page visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('cars-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('cars page with filters visual snapshot', async ({ page }) => {
    // Apply some filters
    const searchInput = page.getByPlaceholderText(/search by name/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('BMW')
    }

    const typeSelect = page.locator('select').first()
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ index: 1 })
    }

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('cars-page-with-filters.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('cars page empty state visual snapshot', async ({ page }) => {
    // Apply filters that return no results
    const searchInput = page.getByPlaceholderText(/search by name/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('NonExistentCar12345')
      await page.waitForTimeout(1000)
    }

    await expect(page).toHaveScreenshot('cars-page-empty-state.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Responsive', () => {
  test('login page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('home-page-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('cars page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('cars-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Components', () => {
  test('navbar component visual snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const navbar = page.locator('nav').first()
    await expect(navbar).toHaveScreenshot('navbar-component.png', {
      animations: 'disabled',
    })
  })

  test('navbar mobile menu visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /toggle menu/i })
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)
    }

    const navbar = page.locator('nav').first()
    await expect(navbar).toHaveScreenshot('navbar-mobile-menu.png', {
      animations: 'disabled',
    })
  })
})

