/**
 * Preferences TypeScript Types
 * 
 * User preferences store with theme, locale, currency, units,
 * reducedMotion, and highContrast settings.
 */

/**
 * Supported locales with BCP-47 tags
 */
export type Locale = 'en' | 'en-US' | 'th' | 'th-TH'

/**
 * Supported currencies
 */
export type Currency = 'USD' | 'THB'

/**
 * Supported themes
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Supported units (for distance, speed, etc.)
 */
export type Units = 'metric' | 'imperial'

/**
 * Preferences interface
 */
export interface Preferences {
  // Locale settings
  locale: Locale
  currency: Currency
  
  // Display settings
  theme: Theme
  units: Units
  reducedMotion: boolean
  highContrast: boolean
  
  // Timestamp
  updatedAt: string
}

/**
 * Default preferences
 */
export const DEFAULT_PREFERENCES: Preferences = {
  locale: 'en',
  currency: 'USD',
  theme: 'system',
  units: 'metric',
  reducedMotion: false,
  highContrast: false,
  updatedAt: new Date().toISOString(),
}

/**
 * Locale configuration
 */
export interface LocaleConfig {
  code: Locale
  name: string
  nativeName: string
  currency: Currency
  dateFormat: string
  timeFormat: string
  numberFormat: string
  flag: string
}

/**
 * Supported locales configuration
 */
export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: 'en-US',
    flag: '🇺🇸',
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: 'en-US',
    flag: '🇺🇸',
  },
  'th': {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    currency: 'THB',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: 'th-TH',
    flag: '🇹🇭',
  },
  'th-TH': {
    code: 'th-TH',
    name: 'Thai (Thailand)',
    nativeName: 'ไทย (ประเทศไทย)',
    currency: 'THB',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: 'th-TH',
    flag: '🇹🇭',
  },
}

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  decimals: number
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    decimals: 2,
  },
}

