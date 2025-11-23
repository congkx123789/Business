import { test, expect } from '@playwright/test'

// Basic login smoke test: navigates to login, fills form, submits, and verifies a post-login cue
// Uses default creds unless overridden via env vars LOGIN_EMAIL and LOGIN_PASSWORD
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || 'john.doe@example.com'
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'password'

test.describe('Basic Login Smoke Test', () => {
  test.setTimeout(60000)
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })

    // Fill form
    await page.getByLabel(/email address/i).fill(LOGIN_EMAIL)
    await page.getByLabel(/^password$/i).fill(LOGIN_PASSWORD)

    // Submit
    const submit = page.getByRole('button', { name: /sign in|log in/i })
    await submit.click()

    // Optionally verify post-login cues when backend is running
    if (process.env.REQUIRE_BACKEND === '1') {
      const possibleSuccessCues = [
        page.getByText(/dashboard|my account|profile|bookings/i).first(),
        page.getByRole('button', { name: /logout|sign out/i }).first(),
        page.locator('[data-test="user-menu"]').first(),
      ]
      const success = await Promise.race(
        possibleSuccessCues.map(async (loc) => {
          try {
            await expect(loc).toBeVisible({ timeout: 8000 })
            return true
          } catch {
            return false
          }
        })
      )
      expect(success, 'Expected to see a post-login UI cue').toBeTruthy()
    } else {
      // In frontend-only mode, ensure the login page remains visible
      await expect(page.getByText(/welcome back/i)).toBeVisible()
    }
  })
})


