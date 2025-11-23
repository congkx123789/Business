/**
 * Market Feature Flags
 * 
 * Feature flags per market for content operations and feature rollout.
 * Supports market-specific features and content slots.
 */

/**
 * Market configuration
 */
export const MARKETS = {
  en: {
    code: 'en',
    name: 'English',
    region: 'US',
    currency: 'USD',
    enabled: true,
    features: {
      // Feature flags per market
      paymentGateway: 'stripe', // 'stripe', 'paypal', 'momo', 'zalopay'
      oauthProviders: ['google', 'github', 'facebook'],
      showPromotions: true,
      showReviews: true,
      showReferral: true,
    },
    contentSlots: {
      // Content slots per locale
      heroBanner: 'hero-banner-en',
      promotions: 'promotions-en',
      testimonials: 'testimonials-en',
    },
  },
  th: {
    code: 'th',
    name: 'ไทย',
    region: 'TH',
    currency: 'THB',
    enabled: true,
    features: {
      paymentGateway: 'stripe', // Can be 'momo', 'zalopay' for TH
      oauthProviders: ['google', 'github', 'facebook'],
      showPromotions: true,
      showReviews: true,
      showReferral: true,
      // TH-specific features
      showThaiLanguageSupport: true,
      showThaiPaymentMethods: false, // Can enable later
    },
    contentSlots: {
      heroBanner: 'hero-banner-th',
      promotions: 'promotions-th',
      testimonials: 'testimonials-th',
    },
  },
}

/**
 * Gets market configuration for locale
 */
export const getMarket = (locale = 'en') => {
  return MARKETS[locale] || MARKETS.en
}

/**
 * Checks if feature is enabled for market
 */
export const isFeatureEnabled = (feature, locale = 'en') => {
  const market = getMarket(locale)
  return market.features[feature] === true || market.features[feature] !== undefined
}

/**
 * Gets feature value for market
 */
export const getFeatureValue = (feature, locale = 'en') => {
  const market = getMarket(locale)
  return market.features[feature]
}

/**
 * Gets content slot for market
 */
export const getContentSlot = (slot, locale = 'en') => {
  const market = getMarket(locale)
  return market.contentSlots[slot] || slot
}

/**
 * Checks if market is enabled
 */
export const isMarketEnabled = (locale = 'en') => {
  const market = getMarket(locale)
  return market.enabled === true
}

/**
 * Gets all enabled markets
 */
export const getEnabledMarkets = () => {
  return Object.values(MARKETS).filter(market => market.enabled)
}

/**
 * Gets market currency
 */
export const getMarketCurrency = (locale = 'en') => {
  const market = getMarket(locale)
  return market.currency
}

/**
 * Gets market region
 */
export const getMarketRegion = (locale = 'en') => {
  const market = getMarket(locale)
  return market.region
}

export default {
  MARKETS,
  getMarket,
  isFeatureEnabled,
  getFeatureValue,
  getContentSlot,
  isMarketEnabled,
  getEnabledMarkets,
  getMarketCurrency,
  getMarketRegion,
}

