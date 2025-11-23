import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import I18nProvider from './components/i18n/I18nProvider'
import ErrorBoundary from './components/Shared/ErrorBoundary'
import { initPerformanceMonitoring } from './utils/performance'
import { initScriptIntegrityMonitoring } from './utils/scriptIntegrity'
import { initMetricsCollection } from './utils/metricsCollector'
import { initMetrics } from './utils/metrics'
import { initRUM } from './utils/rum'
import { initAnalytics } from './utils/analyticsEvents'
import { initAccessibility } from './utils/accessibility'
import { queryDefaults, CACHE_TIMES, GC_TIMES } from './config/queryDefaults'
import { initTheme } from './utils/theme'
import './i18n/config'
import './index.css'

// Initialize theme BEFORE React hydration to prevent flash
// This must be synchronous and run before ReactDOM.render
initTheme()

// Initialize script integrity monitoring for payment pages (Phase 9)
// Only enabled on payment/checkout routes
if (window.location.pathname.includes('/checkout') || window.location.pathname.includes('/payment')) {
  initScriptIntegrityMonitoring()
}

// Initialize performance metrics collection (Phase 10)
initMetricsCollection()
initMetrics() // Core Web Vitals and custom metrics

// Initialize RUM + Sentry (FE-111)
initRUM()

// Initialize analytics (FE-112)
initAnalytics()

// Initialize accessibility (FE-110)
initAccessibility()

/**
 * React Query Client Configuration
 * Cache-aware UI: Tuned staleTime/gcTime by domain aligned with backend TTLs
 * 
 * Frontend cache times are slightly less than backend TTLs to ensure
 * fresh data when backend cache expires.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        // Retry up to 2 times for server errors
        return failureCount < 2
      },
      // Default: Dynamic content (15 min backend -> 14 min frontend)
      staleTime: CACHE_TIMES.DYNAMIC,
      gcTime: GC_TIMES.DYNAMIC,
    },
    mutations: {
      retry: false, // Don't retry mutations
    },
  },
})

/**
 * Configure query-specific cache settings by domain
 * Aligned with backend cache TTLs
 */
Object.entries(queryDefaults).forEach(([key, config]) => {
  queryClient.setQueryDefaults([key], config)
})

// Initialize performance monitoring
initPerformanceMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

