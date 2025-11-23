import { describe, it, expect } from 'vitest'

describe('Sample Test - Testing Infrastructure Verification', () => {
  it('verifies basic testing setup works', () => {
    expect(1 + 1).toBe(2)
  })

  it('verifies async testing works', async () => {
    const promise = Promise.resolve(42)
    const result = await promise
    expect(result).toBe(42)
  })

  it('verifies object matching works', () => {
    const user = { name: 'John', age: 30 }
    expect(user).toMatchObject({ name: 'John' })
  })

  it('verifies array operations work', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })
})
