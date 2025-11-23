/**
 * Enhanced test helper utilities
 */

/**
 * Wait for an element to appear and be visible
 */
export const waitForElement = async (queryFn, options = {}) => {
  const { timeout = 5000, interval = 100 } = options
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const element = queryFn()
    if (element) {
      return element
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Element not found within ${timeout}ms`)
}

/**
 * Create a mock localStorage
 */
export const createMockLocalStorage = () => {
  const store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
    get length() { return Object.keys(store).length },
    key: (index) => Object.keys(store)[index] || null
  }
}

/**
 * Mock auth storage helper
 */
export const mockAuthStorage = (user, token) => {
  const authData = {
    state: {
      user,
      token,
      isAuthenticated: true
    }
  }
  localStorage.setItem('auth-storage', JSON.stringify(authData))
  return authData
}

/**
 * Clear auth storage
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('auth-storage')
}

/**
 * Create mock car data
 */
export const createMockCar = (overrides = {}) => ({
  id: 1,
  brand: 'Toyota',
  name: 'Camry',
  year: 2023,
  type: 'SEDAN',
  pricePerDay: 50.00,
  seats: 5,
  transmission: 'AUTOMATIC',
  fuelType: 'PETROL',
  available: true,
  featured: false,
  description: 'A reliable and comfortable sedan',
  imageUrl: 'https://example.com/car.jpg',
  ...overrides
})

/**
 * Create mock booking data
 */
export const createMockBooking = (overrides = {}) => ({
  id: 1,
  carId: 1,
  userId: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  totalPrice: 150.00,
  status: 'PENDING',
  pickupLocation: 'Downtown',
  dropoffLocation: 'Airport',
  car: createMockCar(),
  ...overrides
})

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: 'CUSTOMER',
  ...overrides
})

/**
 * Helper to wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Helper to flush promises
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve))

/**
 * Mock window.matchMedia for responsive tests
 */
export const mockMatchMedia = (matches = false) => {
  const mockFn = typeof vi !== 'undefined' ? vi.fn() : jest.fn()
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockFn.mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: mockFn(),
      removeListener: mockFn(),
      addEventListener: mockFn(),
      removeEventListener: mockFn(),
      dispatchEvent: mockFn(),
    })),
  })
}

/**
 * Create a delay helper for testing loading states
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Assert that an element has accessibility attributes
 */
export const assertAccessibility = (element) => {
  expect(element).toHaveAttribute('role')
  // Add more accessibility checks as needed
}

