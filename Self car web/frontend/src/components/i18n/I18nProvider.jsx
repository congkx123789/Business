import { useEffect, useState, Suspense } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import i18n, { waitForI18n, isI18nReady } from '../../i18n/config'
import { usePreferencesStore } from '../../store/preferencesStore'

/**
 * I18nProvider Component (FE-090)
 * 
 * Provides i18n context with hydration guards:
 * - Waits for i18n initialization before rendering
 * - Syncs with preferences store
 * - Prevents hydration mismatches
 */
const I18nInitializer = ({ children }) => {
  const [isReady, setIsReady] = useState(false)
  const { locale } = usePreferencesStore()
  const { i18n: i18nInstance } = useTranslation()

  useEffect(() => {
    // Wait for i18n to be ready
    waitForI18n().then(() => {
      // Sync with preferences store
      if (locale && i18nInstance.language !== locale) {
        i18nInstance.changeLanguage(locale)
      }
      setIsReady(true)
    })
  }, [locale, i18nInstance])

  // Show loading state while i18n initializes
  if (!isReady || !isI18nReady()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

const I18nProvider = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-bg-primary">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-dark-text-secondary">Loading translations...</p>
            </div>
          </div>
        }
      >
        <I18nInitializer>{children}</I18nInitializer>
      </Suspense>
    </I18nextProvider>
  )
}

export default I18nProvider

