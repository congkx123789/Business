/**
 * Preferences Store
 * 
 * Zustand store for user preferences:
 * - Theme (light, dark, system)
 * - Locale (en, th-TH)
 * - Currency (USD, THB)
 * - Units (metric, imperial)
 * - Reduced motion
 * - High contrast
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Preferences, Locale, Currency, Theme, Units } from '../types/preferences'
import { DEFAULT_PREFERENCES } from '../types/preferences'

interface PreferencesStore extends Preferences {
  // Actions
  setLocale: (locale: Locale) => void
  setCurrency: (currency: Currency) => void
  setTheme: (theme: Theme) => void
  setUnits: (units: Units) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setHighContrast: (highContrast: boolean) => void
  reset: () => void
}

/**
 * Preferences store
 */
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      
      // Actions
      setLocale: (locale) => set({ locale, updatedAt: new Date().toISOString() }),
      setCurrency: (currency) => set({ currency, updatedAt: new Date().toISOString() }),
      setTheme: (theme) => set({ theme, updatedAt: new Date().toISOString() }),
      setUnits: (units) => set({ units, updatedAt: new Date().toISOString() }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion, updatedAt: new Date().toISOString() }),
      setHighContrast: (highContrast) => set({ highContrast, updatedAt: new Date().toISOString() }),
      reset: () => set({ ...DEFAULT_PREFERENCES, updatedAt: new Date().toISOString() }),
    }),
    {
      name: 'preferences-storage',
      version: 1,
    }
  )
)

