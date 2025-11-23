/**
 * Smoke Test Script
 * Verifies that core API endpoints are accessible
 * 
 * Usage:
 *   - Run from browser console: import('./test/smoke-test.js').then(m => m.smokeTest())
 *   - Or run in Node.js: node src/test/smoke-test.js (requires axios)
 */

import api, { authAPI, carAPI, bookingAPI } from '../services/api.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * Test result helper
 */
const testResult = (name, passed, message, data = null) => {
  const result = {
    name,
    passed,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
  console.log(
    `[${passed ? '✓' : '✗'}] ${name}: ${message}`,
    data ? '\n  Data:', data : ''
  )
  return result
}

/**
 * Smoke test for /api/auth/login endpoint
 */
export const testAuthLogin = async () => {
  try {
    // Test with invalid credentials (should fail gracefully)
    const response = await authAPI.login({
      email: 'test@example.com',
      password: 'invalid',
    })
    
    // If we get here, the endpoint is accessible
    return testResult(
      'Auth Login Endpoint',
      true,
      'Endpoint accessible (expected 400/401 for invalid credentials)',
      { status: response.status }
    )
  } catch (error) {
    if (error.response) {
      // Endpoint exists and responded
      const status = error.response.status
      if (status === 400 || status === 401) {
        return testResult(
          'Auth Login Endpoint',
          true,
          `Endpoint accessible (${status} as expected for invalid credentials)`,
          { status }
        )
      }
      return testResult(
        'Auth Login Endpoint',
        false,
        `Unexpected status: ${status}`,
        { status, data: error.response.data }
      )
    } else if (error.request) {
      // Network error
      return testResult(
        'Auth Login Endpoint',
        false,
        'Network error - backend may not be running',
        { error: error.message }
      )
    } else {
      return testResult(
        'Auth Login Endpoint',
        false,
        'Request setup error',
        { error: error.message }
      )
    }
  }
}

/**
 * Smoke test for /api/cars endpoint
 */
export const testCarsEndpoint = async () => {
  try {
    const response = await carAPI.getAllCars()
    return testResult(
      'Cars Endpoint',
      true,
      'Endpoint accessible',
      {
        status: response.status,
        carsCount: Array.isArray(response.data) ? response.data.length : 0,
      }
    )
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      // 401 is acceptable if not authenticated
      if (status === 401) {
        return testResult(
          'Cars Endpoint',
          true,
          'Endpoint accessible (authentication required)',
          { status }
        )
      }
      return testResult(
        'Cars Endpoint',
        false,
        `Unexpected status: ${status}`,
        { status, data: error.response.data }
      )
    } else if (error.request) {
      return testResult(
        'Cars Endpoint',
        false,
        'Network error - backend may not be running',
        { error: error.message }
      )
    } else {
      return testResult(
        'Cars Endpoint',
        false,
        'Request setup error',
        { error: error.message }
      )
    }
  }
}

/**
 * Smoke test for /api/bookings endpoint
 */
export const testBookingsEndpoint = async () => {
  try {
    // Try to get user bookings (requires auth)
    const response = await bookingAPI.getUserBookings()
    return testResult(
      'Bookings Endpoint',
      true,
      'Endpoint accessible',
      {
        status: response.status,
        bookingsCount: Array.isArray(response.data) ? response.data.length : 0,
      }
    )
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      // 401 is expected if not authenticated
      if (status === 401) {
        return testResult(
          'Bookings Endpoint',
          true,
          'Endpoint accessible (authentication required)',
          { status }
        )
      }
      return testResult(
        'Bookings Endpoint',
        false,
        `Unexpected status: ${status}`,
        { status, data: error.response.data }
      )
    } else if (error.request) {
      return testResult(
        'Bookings Endpoint',
        false,
        'Network error - backend may not be running',
        { error: error.message }
      )
    } else {
      return testResult(
        'Bookings Endpoint',
        false,
        'Request setup error',
        { error: error.message }
      )
    }
  }
}

/**
 * Test /api/auth/me endpoint
 */
export const testAuthMe = async () => {
  try {
    const response = await authAPI.getCurrentUser()
    return testResult(
      'Auth Me Endpoint',
      true,
      'Endpoint accessible and authenticated',
      {
        status: response.status,
        user: response.data,
      }
    )
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      // 401 is expected if not authenticated
      if (status === 401) {
        return testResult(
          'Auth Me Endpoint',
          true,
          'Endpoint accessible (authentication required)',
          { status }
        )
      }
      return testResult(
        'Auth Me Endpoint',
        false,
        `Unexpected status: ${status}`,
        { status, data: error.response.data }
      )
    } else if (error.request) {
      return testResult(
        'Auth Me Endpoint',
        false,
        'Network error - backend may not be running',
        { error: error.message }
      )
    } else {
      return testResult(
        'Auth Me Endpoint',
        false,
        'Request setup error',
        { error: error.message }
      )
    }
  }
}

/**
 * Run all smoke tests
 */
export const smokeTest = async () => {
  console.log('🚀 Starting API Smoke Tests...')
  console.log(`📍 API Base URL: ${API_BASE_URL}`)
  console.log('─'.repeat(60))

  const results = []

  // Test endpoints
  results.push(await testAuthLogin())
  results.push(await testCarsEndpoint())
  results.push(await testBookingsEndpoint())
  results.push(await testAuthMe())

  // Summary
  console.log('─'.repeat(60))
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(`\n📊 Results: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('✅ All smoke tests passed!')
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.')
  }

  return {
    passed,
    total,
    results,
    allPassed: passed === total,
  }
}

// Export default for convenience
export default smokeTest

