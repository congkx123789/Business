import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  getMarket, 
  isFeatureEnabled, 
  getFeatureValue, 
  getContentSlot,
  getMarketCurrency,
  getMarketRegion 
} from '../features/marketFlags'

/**
 * Market Hook
 * 
 * Provides market-specific features and content slots.
 * Handles feature flags and content operations per market.
 */
export const useMarket = () => {
  const { i18n } = useTranslation()
  const locale = i18n.language || 'en'
  
  const market = useMemo(() => getMarket(locale), [locale])
  
  const checkFeature = useMemo(() => {
    return (feature) => isFeatureEnabled(feature, locale)
  }, [locale])
  
  const getFeature = useMemo(() => {
    return (feature) => getFeatureValue(feature, locale)
  }, [locale])
  
  const getSlot = useMemo(() => {
    return (slot) => getContentSlot(slot, locale)
  }, [locale])
  
  const currency = useMemo(() => getMarketCurrency(locale), [locale])
  const region = useMemo(() => getMarketRegion(locale), [locale])
  
  return {
    market,
    locale,
    currency,
    region,
    isFeatureEnabled: checkFeature,
    getFeatureValue: getFeature,
    getContentSlot: getSlot,
  }
}

export default useMarket

