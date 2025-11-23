import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted() to create variables that can be accessed in the mock factory
const { mockAxiosInstance, mockCreateFn } = vi.hoisted(() => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }
  
  return {
    mockAxiosInstance: instance,
    mockCreateFn: vi.fn(() => instance),
  }
})

// Mock axios module before importing the API module
vi.mock('axios', () => ({
  default: {
    create: mockCreateFn,
  },
}))

// Import after mocking
import { authAPI, carAPI, bookingAPI, userAPI, dashboardAPI } from '../api'

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auth API', () => {
    it('calls login endpoint with correct parameters', async () => {
      const credentials = { email: 'test@example.com', password: 'password' }
      const expectedResponse = { data: { user: {}, token: 'token' } }
      mockAxiosInstance.post.mockResolvedValue(expectedResponse)
      
      const result = await authAPI.login(credentials)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(expectedResponse)
    })

    it('calls register endpoint with correct parameters', async () => {
      const userData = { email: 'test@example.com', password: 'password', firstName: 'Test' }
      const expectedResponse = { data: { user: {}, token: 'token' } }
      mockAxiosInstance.post.mockResolvedValue(expectedResponse)
      
      const result = await authAPI.register(userData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls getCurrentUser endpoint', async () => {
      const expectedResponse = { data: { user: {} } }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await authAPI.getCurrentUser()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('Car API', () => {
    it('calls getAllCars with query parameters', async () => {
      const params = { page: 1, limit: 10 }
      const expectedResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.getAllCars(params)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars', { params })
      expect(result).toEqual(expectedResponse)
    })

    it('calls getCarById with correct ID', async () => {
      const carId = 1
      const expectedResponse = { data: { id: 1, name: 'Test Car' } }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.getCarById(carId)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/1')
      expect(result).toEqual(expectedResponse)
    })

    it('calls createCar with car data', async () => {
      const carData = { name: 'Test Car', brand: 'Toyota' }
      const expectedResponse = { data: { id: 1, ...carData } }
      mockAxiosInstance.post.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.createCar(carData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/cars', carData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls updateCar with ID and car data', async () => {
      const carId = 1
      const carData = { name: 'Updated Car' }
      const expectedResponse = { data: { id: 1, ...carData } }
      mockAxiosInstance.put.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.updateCar(carId, carData)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/cars/1', carData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls deleteCar with correct ID', async () => {
      const carId = 1
      const expectedResponse = { data: { success: true } }
      mockAxiosInstance.delete.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.deleteCar(carId)
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/cars/1')
      expect(result).toEqual(expectedResponse)
    })

    it('calls getAvailableCars with date parameters', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-05'
      const expectedResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await carAPI.getAvailableCars(startDate, endDate)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/cars/available', {
        params: { startDate, endDate }
      })
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('Booking API', () => {
    it('calls createBooking with booking data', async () => {
      const bookingData = { carId: 1, startDate: '2024-01-01', endDate: '2024-01-05' }
      const expectedResponse = { data: { id: 1, ...bookingData } }
      mockAxiosInstance.post.mockResolvedValue(expectedResponse)
      
      const result = await bookingAPI.createBooking(bookingData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bookings', bookingData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls getUserBookings', async () => {
      const expectedResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await bookingAPI.getUserBookings()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/user')
      expect(result).toEqual(expectedResponse)
    })

    it('calls getAllBookings', async () => {
      const expectedResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await bookingAPI.getAllBookings()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings')
      expect(result).toEqual(expectedResponse)
    })

    it('calls updateBookingStatus with ID and status', async () => {
      const bookingId = 1
      const status = 'CONFIRMED'
      const expectedResponse = { data: { id: 1, status } }
      mockAxiosInstance.patch.mockResolvedValue(expectedResponse)
      
      const result = await bookingAPI.updateBookingStatus(bookingId, status)
      
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/bookings/1/status', { status })
      expect(result).toEqual(expectedResponse)
    })

    it('calls cancelBooking with correct ID', async () => {
      const bookingId = 1
      const expectedResponse = { data: { success: true } }
      mockAxiosInstance.delete.mockResolvedValue(expectedResponse)
      
      const result = await bookingAPI.cancelBooking(bookingId)
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/bookings/1')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('User API', () => {
    it('calls updateProfile with user data', async () => {
      const userData = { firstName: 'Updated', lastName: 'User' }
      const expectedResponse = { data: { id: 1, ...userData } }
      mockAxiosInstance.put.mockResolvedValue(expectedResponse)
      
      const result = await userAPI.updateProfile(userData)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/profile', userData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls changePassword with password data', async () => {
      const passwordData = { currentPassword: 'old', newPassword: 'new' }
      const expectedResponse = { data: { success: true } }
      mockAxiosInstance.put.mockResolvedValue(expectedResponse)
      
      const result = await userAPI.changePassword(passwordData)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/password', passwordData)
      expect(result).toEqual(expectedResponse)
    })

    it('calls getAllUsers', async () => {
      const expectedResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await userAPI.getAllUsers()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('Dashboard API', () => {
    it('calls getStats', async () => {
      const expectedResponse = { data: { totalCars: 10, totalBookings: 5 } }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await dashboardAPI.getStats()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/stats')
      expect(result).toEqual(expectedResponse)
    })

    it('calls getRevenueData with period parameter', async () => {
      const period = 'month'
      const expectedResponse = { data: { revenue: 1000 } }
      mockAxiosInstance.get.mockResolvedValue(expectedResponse)
      
      const result = await dashboardAPI.getRevenueData(period)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/revenue', {
        params: { period }
      })
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('Error Handling', () => {
    it('propagates API errors correctly', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValue(mockError)
      
      await expect(carAPI.getAllCars()).rejects.toThrow('Network Error')
    })

    it('handles response errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      }
      mockAxiosInstance.get.mockRejectedValue(mockError)
      
      await expect(carAPI.getCarById(999)).rejects.toEqual(mockError)
    })
  })
})
