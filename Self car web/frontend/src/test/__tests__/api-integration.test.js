import { describe, it, expect } from 'vitest'
import { authAPI, carAPI } from '../../services/api'

describe('API Integration Tests with MSW', () => {
  it('successfully mocks login API call', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    }

    const response = await authAPI.login(credentials)
    
    expect(response.data).toEqual({
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER'
      },
      token: 'mock-jwt-token'
    })
  })

  it('successfully mocks car API call', async () => {
    const response = await carAPI.getAllCars({ page: 1, limit: 10 })
    
    expect(response.data.cars).toHaveLength(2)
    expect(response.data.cars[0]).toMatchObject({
      id: 1,
      name: 'Toyota Camry',
      brand: 'Toyota',
      year: 2023,
      pricePerDay: 50
    })
  })

  it('handles API errors correctly', async () => {
    const credentials = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }

    await expect(authAPI.login(credentials)).rejects.toMatchObject({
      status: 401
    })
  })

  it('successfully creates a new car', async () => {
    const carData = {
      name: 'Tesla Model 3',
      brand: 'Tesla',
      year: 2024,
      pricePerDay: 80
    }

    const response = await carAPI.createCar(carData)
    
    expect(response.data).toMatchObject({
      id: 3,
      ...carData
    })
    expect(response.data.createdAt).toBeDefined()
  })
})
