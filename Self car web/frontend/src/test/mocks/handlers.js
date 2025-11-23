import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Enhanced MSW handlers matching actual backend API endpoints
 * Keeps tests in sync with backend responses and redirects
 */

// Mock data generators
const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  role: 'CUSTOMER',
  enabled: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockCar = (overrides = {}) => ({
  id: 1,
  name: 'Toyota Camry',
  brand: 'Toyota',
  year: 2023,
  type: 'SEDAN',
  seats: 5,
  transmission: 'AUTOMATIC',
  fuelType: 'PETROL',
  pricePerDay: 50.00,
  available: true,
  featured: false,
  description: 'A reliable and comfortable sedan perfect for daily commutes.',
  imageUrl: 'https://example.com/car.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockBooking = (overrides = {}) => ({
  id: 1,
  carId: 1,
  userId: 1,
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  pickupLocation: 'Downtown Office',
  dropoffLocation: 'Airport',
  totalPrice: 250.00,
  status: 'PENDING',
  createdAt: '2024-01-01T00:00:00Z',
  car: createMockCar(),
  ...overrides,
})

export const handlers = [
  // ==================== Auth Endpoints ====================
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()
    
    // Successful login
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        user: createMockUser({ email }),
        token: 'mock-jwt-token-12345',
        tokenType: 'Bearer',
      })
    }
    
    // Admin login
    if (email === 'admin@example.com' && password === 'admin123') {
      return HttpResponse.json({
        user: createMockUser({ 
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN' 
        }),
        token: 'mock-admin-jwt-token',
        tokenType: 'Bearer',
      })
    }
    
    // Failed login
    return HttpResponse.json(
      { message: 'Invalid email or password', error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const userData = await request.json()
    
    // Check if email already exists
    if (userData.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already exists', error: 'Conflict' },
        { status: 409 }
      )
    }
    
    return HttpResponse.json({
      user: createMockUser({ 
        id: 2,
        ...userData,
        role: 'CUSTOMER',
      }),
      token: 'mock-jwt-token-new-user',
      tokenType: 'Bearer',
    }, { status: 201 })
  }),

  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return HttpResponse.json(
        { message: 'Unauthorized', error: 'Missing or invalid token' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      user: createMockUser(),
    })
  }),

  // OAuth2 endpoints
  http.get(`${API_BASE_URL}/oauth2/authorization/:provider`, ({ params }) => {
    const { provider } = params
    // Redirect to OAuth provider (simulated)
    return HttpResponse.redirect(`https://${provider}.com/oauth/authorize`)
  }),

  // ==================== Car Endpoints ====================
  http.get(`${API_BASE_URL}/cars`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const brand = url.searchParams.get('brand')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const sort = url.searchParams.get('sort')
    const sortDir = url.searchParams.get('sortDir') || 'asc'
    
    // Generate mock cars (more for pagination testing)
    let cars = Array.from({ length: 25 }, (_, i) => 
      createMockCar({ 
        id: i + 1, 
        name: `Car ${i + 1}`, 
        brand: ['Toyota', 'Honda', 'BMW', 'Ford', 'Mercedes'][i % 5],
        pricePerDay: 30 + (i * 5),
        type: ['SEDAN', 'SUV', 'SPORTS', 'LUXURY', 'VAN'][i % 5],
        available: i % 3 !== 0,
      })
    )
    
    // Filter cars based on search params
    if (search) {
      cars = cars.filter(car => 
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (brand) {
      cars = cars.filter(car => car.brand === brand)
    }
    
    if (minPrice) {
      cars = cars.filter(car => car.pricePerDay >= parseFloat(minPrice))
    }
    
    if (maxPrice) {
      cars = cars.filter(car => car.pricePerDay <= parseFloat(maxPrice))
    }
    
    // Sort cars
    if (sort) {
      cars.sort((a, b) => {
        let aVal = a[sort]
        let bVal = b[sort]
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortDir === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      })
    }
    
    const total = cars.length
    const start = page * size
    const end = start + size
    const paginatedCars = cars.slice(start, end)
    
    // Return paginated response
    return HttpResponse.json({
      content: paginatedCars,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      page,
      size,
      first: page === 0,
      last: end >= total,
    })
  }),

  http.get(`${API_BASE_URL}/cars/:id`, ({ params }) => {
    const { id } = params
    const carId = Number(id)
    
    if (carId === 999) {
      return HttpResponse.json(
        { message: 'Car not found', error: 'Not Found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(createMockCar({ id: carId }))
  }),

  http.post(`${API_BASE_URL}/cars`, async ({ request }) => {
    const carData = await request.json()
    return HttpResponse.json({
      ...createMockCar({ id: 3 }),
      ...carData,
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/cars/:id`, async ({ params, request }) => {
    const { id } = params
    const carData = await request.json()
    return HttpResponse.json({
      ...createMockCar({ id: Number(id) }),
      ...carData,
      updatedAt: new Date().toISOString()
    })
  }),

  http.delete(`${API_BASE_URL}/cars/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({ 
      message: 'Car deleted successfully',
      deletedId: Number(id) 
    })
  }),

  http.patch(`${API_BASE_URL}/cars/:id/toggle-availability`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      ...createMockCar({ id: Number(id), available: false }),
      updatedAt: new Date().toISOString()
    })
  }),

  http.patch(`${API_BASE_URL}/cars/bulk/toggle-availability`, async ({ request }) => {
    const { ids, available } = await request.json()
    return HttpResponse.json({
      message: `${ids.length} car(s) ${available ? 'enabled' : 'disabled'} successfully`,
      updatedIds: ids,
      available,
    })
  }),

  http.get(`${API_BASE_URL}/cars/available`, ({ request }) => {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    return HttpResponse.json([
      createMockCar({ id: 1, available: true }),
      createMockCar({ id: 2, available: true }),
    ])
  }),

  // ==================== Booking Endpoints ====================
  http.post(`${API_BASE_URL}/bookings`, async ({ request }) => {
    const bookingData = await request.json()
    
    // Validation check
    if (!bookingData.carId || !bookingData.startDate || !bookingData.endDate) {
      return HttpResponse.json(
        { message: 'Missing required fields', error: 'Bad Request' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      ...createMockBooking(),
      ...bookingData,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  http.get(`${API_BASE_URL}/bookings/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized', error: 'Missing token' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json([
      createMockBooking({ id: 1, status: 'CONFIRMED' }),
      createMockBooking({ id: 2, status: 'PENDING' }),
      createMockBooking({ id: 3, status: 'COMPLETED' }),
    ])
  }),

  http.get(`${API_BASE_URL}/bookings`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized', error: 'Missing token' },
        { status: 401 }
      )
    }
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const sort = url.searchParams.get('sort')
    const sortDir = url.searchParams.get('sortDir') || 'desc'
    
    // Generate mock bookings
    let bookings = Array.from({ length: 20 }, (_, i) => 
      createMockBooking({ 
        id: i + 1,
        status: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'][i % 4],
        totalPrice: 100 + (i * 25),
        startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + (i + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    )
    
    // Sort bookings
    if (sort) {
      bookings.sort((a, b) => {
        let aVal = a[sort]
        let bVal = b[sort]
        
        if (sort === 'startDate' || sort === 'endDate') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortDir === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      })
    }
    
    const total = bookings.length
    const start = page * size
    const end = start + size
    const paginatedBookings = bookings.slice(start, end)
    
    // Return paginated response if pagination params exist
    if (url.searchParams.has('page') || url.searchParams.has('size')) {
      return HttpResponse.json({
        content: paginatedBookings,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        page,
        size,
        first: page === 0,
        last: end >= total,
      })
    }
    
    // Return non-paginated response for backward compatibility
    return HttpResponse.json([
      createMockBooking({ id: 1, status: 'CONFIRMED' }),
      createMockBooking({ id: 2, status: 'PENDING' }),
    ])
  }),

  http.get(`${API_BASE_URL}/bookings/:id`, ({ params }) => {
    const { id } = params
    const bookingId = Number(id)
    
    if (bookingId === 999) {
      return HttpResponse.json(
        { message: 'Booking not found', error: 'Not Found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(createMockBooking({ id: bookingId }))
  }),

  http.patch(`${API_BASE_URL}/bookings/:id/status`, async ({ params, request }) => {
    const { id } = params
    const { status } = await request.json()
    
    return HttpResponse.json({
      ...createMockBooking({ id: Number(id) }),
      status,
      updatedAt: new Date().toISOString()
    })
  }),

  http.delete(`${API_BASE_URL}/bookings/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({ 
      message: 'Booking cancelled successfully',
      cancelledId: Number(id) 
    })
  }),

  // ==================== User Endpoints ====================
  http.put(`${API_BASE_URL}/users/profile`, async ({ request }) => {
    const userData = await request.json()
    return HttpResponse.json({
      ...createMockUser(),
      ...userData,
      updatedAt: new Date().toISOString()
    })
  }),

  http.put(`${API_BASE_URL}/users/password`, async ({ request }) => {
    const { currentPassword, newPassword } = await request.json()
    
    if (currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        { message: 'Current password is incorrect', error: 'Bad Request' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({ 
      message: 'Password updated successfully',
      success: true 
    })
  }),

  http.get(`${API_BASE_URL}/users`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized', error: 'Missing token' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json([
      createMockUser({ id: 1, email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'CUSTOMER' }),
      createMockUser({ id: 2, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' }),
    ])
  }),

  // ==================== Dashboard Endpoints ====================
  http.get(`${API_BASE_URL}/dashboard/stats`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized', error: 'Missing token' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      totalCars: 10,
      totalBookings: 25,
      totalUsers: 50,
      totalRevenue: 5000.00,
      activeBookings: 8,
      pendingBookings: 5,
      recentBookings: 5,
    })
  }),

  http.get(`${API_BASE_URL}/dashboard/revenue`, ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'
    
    return HttpResponse.json({
      period,
      revenue: 2500.00,
      previousPeriod: 2200.00,
      growth: 13.6,
      data: [
        { date: '2024-01', revenue: 800 },
        { date: '2024-02', revenue: 950 },
        { date: '2024-03', revenue: 750 },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/dashboard/analytics`, () => {
    return HttpResponse.json({
      totalViews: 1250,
      totalInquiries: 89,
      conversionRate: 7.12,
      viewsChange: 12.5,
      inquiriesChange: 8.3,
      conversionChange: 2.1,
      topViewedCars: [
        { id: 1, name: 'Toyota Camry', views: 245 },
        { id: 2, name: 'Honda Civic', views: 189 },
      ],
      inquirySources: {
        website: 45,
        mobile: 32,
        referral: 12,
      },
    })
  }),

  // ==================== Messages Endpoints ====================
  http.get(`${API_BASE_URL}/messages`, ({ request }) => {
    return HttpResponse.json([
      {
        id: 1,
        senderId: 1,
        recipientId: 2,
        content: 'Hello, I have a question about the car.',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ])
  }),

  // ==================== Error Handlers for Testing ====================
  http.get(`${API_BASE_URL}/cars/error`, () => {
    return HttpResponse.json(
      { message: 'Internal server error', error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  http.post(`${API_BASE_URL}/auth/login-error`, () => {
    return HttpResponse.json(
      { message: 'Invalid credentials', error: 'Unauthorized' },
      { status: 401 }
    )
  }),
]
