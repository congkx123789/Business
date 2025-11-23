/**
 * Translation Export/Import Utilities (FE-092)
 * 
 * Utilities for:
 * - Exporting translation keys
 * - Importing translations
 * - Generating translation reports
 * - Finding missing keys
 */

import i18n from '../i18n/config'

/**
 * Export all translation keys for a namespace
 */
export const exportTranslationKeys = (namespace, locale = 'en') => {
  const resources = i18n.getResourceBundle(locale, namespace)
  return JSON.stringify(resources, null, 2)
}

/**
 * Export all translation keys for all namespaces
 */
export const exportAllTranslationKeys = (locale = 'en') => {
  const namespaces = i18n.options.ns || []
  const allTranslations = {}

  namespaces.forEach(ns => {
    const resources = i18n.getResourceBundle(locale, ns)
    if (resources) {
      allTranslations[ns] = resources
    }
  })

  return JSON.stringify(allTranslations, null, 2)
}

/**
 * Find missing translation keys
 */
export const findMissingKeys = (sourceLocale = 'en', targetLocale = 'th') => {
  const namespaces = i18n.options.ns || []
  const missing = {}

  namespaces.forEach(ns => {
    const sourceResources = i18n.getResourceBundle(sourceLocale, ns) || {}
    const targetResources = i18n.getResourceBundle(targetLocale, ns) || {}
    const missingKeys = []

    const findKeys = (obj, path = '') => {
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findKeys(obj[key], currentPath)
        } else {
          // Check if key exists in target
          const targetValue = getNestedValue(targetResources, currentPath)
          if (!targetValue) {
            missingKeys.push({
              key: currentPath,
              value: obj[key],
            })
          }
        }
      })
    }

    findKeys(sourceResources)

    if (missingKeys.length > 0) {
      missing[ns] = missingKeys
    }
  })

  return missing
}

/**
 * Get nested value from object using dot notation
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

/**
 * Generate translation report
 */
export const generateTranslationReport = () => {
  const locales = i18n.options.supportedLngs || []
  const namespaces = i18n.options.ns || []
  const report = {
    locales,
    namespaces,
    coverage: {},
    missing: {},
  }

  locales.forEach(locale => {
    report.coverage[locale] = {}
    report.missing[locale] = {}

    namespaces.forEach(ns => {
      const resources = i18n.getResourceBundle(locale, ns) || {}
      const totalKeys = countKeys(resources)
      const sourceResources = i18n.getResourceBundle('en', ns) || {}
      const sourceTotalKeys = countKeys(sourceResources)
      
      report.coverage[locale][ns] = {
        total: totalKeys,
        sourceTotal: sourceTotalKeys,
        coverage: sourceTotalKeys > 0 ? ((totalKeys / sourceTotalKeys) * 100).toFixed(2) + '%' : '0%',
      }
    })
  })

  return report
}

/**
 * Count keys in nested object
 */
const countKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return 0
  }

  let count = 0
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key])
    } else {
      count++
    }
  })

  return count
}

/**
 * Download translation keys as JSON file
 */
export const downloadTranslationKeys = (locale = 'en', namespace = null) => {
  const data = namespace 
    ? exportTranslationKeys(namespace, locale)
    : exportAllTranslationKeys(locale)
  
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = namespace 
    ? `translations-${locale}-${namespace}.json`
    : `translations-${locale}-all.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default {
  exportTranslationKeys,
  exportAllTranslationKeys,
  findMissingKeys,
  generateTranslationReport,
  downloadTranslationKeys,
}

