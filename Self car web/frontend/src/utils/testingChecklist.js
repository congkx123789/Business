/**
 * Testing Checklist Utility - Phase 10
 * 
 * Automated and manual testing checklist for QA gates
 * Covers: SSR locale, accessibility, performance, route focus, screen reader, slow device
 */

/**
 * Testing Checklist Configuration
 */
export const TESTING_CHECKLIST = {
  // SSR Locale Testing
  ssrLocale: {
    title: 'SSR Locale Testing',
    items: [
      { id: 'ssr-1', name: 'Verify locale detection from URL', checked: false },
      { id: 'ssr-2', name: 'Verify locale detection from cookie', checked: false },
      { id: 'ssr-3', name: 'Verify locale detection from localStorage', checked: false },
      { id: 'ssr-4', name: 'Verify locale detection from browser', checked: false },
      { id: 'ssr-5', name: 'Verify locale persistence across page reloads', checked: false },
      { id: 'ssr-6', name: 'Verify locale switching updates all text', checked: false },
      { id: 'ssr-7', name: 'Verify date/number formatting matches locale', checked: false },
      { id: 'ssr-8', name: 'Verify RTL support for Arabic locales', checked: false },
    ],
  },

  // Accessibility Testing
  accessibility: {
    title: 'Accessibility Testing',
    items: [
      { id: 'a11y-1', name: 'All images have alt text', checked: false },
      { id: 'a11y-2', name: 'All interactive elements are keyboard accessible', checked: false },
      { id: 'a11y-3', name: 'Focus indicators are visible', checked: false },
      { id: 'a11y-4', name: 'ARIA labels are properly used', checked: false },
      { id: 'a11y-5', name: 'Color contrast meets WCAG AA standards', checked: false },
      { id: 'a11y-6', name: 'Forms have proper labels and error messages', checked: false },
      { id: 'a11y-7', name: 'Skip links are present and functional', checked: false },
      { id: 'a11y-8', name: 'Headings follow proper hierarchy (h1 → h2 → h3)', checked: false },
      { id: 'a11y-9', name: 'No keyboard traps', checked: false },
      { id: 'a11y-10', name: 'Landmarks are properly defined (main, nav, footer)', checked: false },
    ],
  },

  // Performance Testing
  performance: {
    title: 'Performance Testing',
    items: [
      { id: 'perf-1', name: 'LCP < 2.5s on 75% mobile devices', checked: false },
      { id: 'perf-2', name: 'CLS < 0.1', checked: false },
      { id: 'perf-3', name: 'FID < 100ms', checked: false },
      { id: 'perf-4', name: 'TTFB aligned with SSR/edge strategy', checked: false },
      { id: 'perf-5', name: 'Search latency < 500ms', checked: false },
      { id: 'perf-6', name: 'PDP latency < 800ms', checked: false },
      { id: 'perf-7', name: 'Images are optimized (WebP/AVIF, responsive)', checked: false },
      { id: 'perf-8', name: 'Code splitting is working (check Network tab)', checked: false },
      { id: 'perf-9', name: 'Cache hits are optimized (check React Query DevTools)', checked: false },
      { id: 'perf-10', name: 'Bundle size is within targets', checked: false },
    ],
  },

  // Route Focus Testing
  routeFocus: {
    title: 'Route Focus Testing',
    items: [
      { id: 'focus-1', name: 'Focus moves to main content on route change', checked: false },
      { id: 'focus-2', name: 'Focus is announced to screen readers on route change', checked: false },
      { id: 'focus-3', name: 'Focus is restored after modal/dialog closes', checked: false },
      { id: 'focus-4', name: 'Focus trap works in modals', checked: false },
      { id: 'focus-5', name: 'Focus order is logical (tab order)', checked: false },
    ],
  },

  // Screen Reader Testing
  screenReader: {
    title: 'Screen Reader Testing',
    items: [
      { id: 'sr-1', name: 'Page title is announced correctly', checked: false },
      { id: 'sr-2', name: 'Landmarks are announced (main, navigation, etc.)', checked: false },
      { id: 'sr-3', name: 'Form errors are announced', checked: false },
      { id: 'sr-4', name: 'Dynamic content updates are announced', checked: false },
      { id: 'sr-5', name: 'Button labels are descriptive', checked: false },
      { id: 'sr-6', name: 'Link text is descriptive (not "click here")', checked: false },
      { id: 'sr-7', name: 'Data tables have proper headers', checked: false },
      { id: 'sr-8', name: 'Status messages use aria-live regions', checked: false },
    ],
  },

  // Slow Device Testing
  slowDevice: {
    title: 'Slow Device Testing',
    items: [
      { id: 'slow-1', name: 'App loads on 3G connection (< 5s)', checked: false },
      { id: 'slow-2', name: 'Loading states are shown during data fetch', checked: false },
      { id: 'slow-3', name: 'Error states are shown on network failure', checked: false },
      { id: 'slow-4', name: 'Progressive image loading works', checked: false },
      { id: 'slow-5', name: 'Skeleton loaders are shown for slow content', checked: false },
      { id: 'slow-6', name: 'App is usable on low-end devices (test on throttled CPU)', checked: false },
      { id: 'slow-7', name: 'No layout shifts during loading', checked: false },
    ],
  },
}

/**
 * Run automated accessibility tests
 */
export const runAutomatedA11yTests = async () => {
  if (typeof window === 'undefined') return { passed: false, errors: [] }

  const errors = []

  // Check for images without alt text
  const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(
    (img) => !img.alt && !img.getAttribute('aria-hidden')
  )
  if (imagesWithoutAlt.length > 0) {
    errors.push({
      type: 'missing-alt',
      message: `Found ${imagesWithoutAlt.length} images without alt text`,
      elements: imagesWithoutAlt.map((img) => img.src),
    })
  }

  // Check for buttons without accessible names
  const buttonsWithoutName = Array.from(document.querySelectorAll('button')).filter(
    (button) => !button.textContent?.trim() && !button.getAttribute('aria-label')
  )
  if (buttonsWithoutName.length > 0) {
    errors.push({
      type: 'button-no-name',
      message: `Found ${buttonsWithoutName.length} buttons without accessible names`,
    })
  }

  // Check for form inputs without labels
  const inputsWithoutLabels = Array.from(document.querySelectorAll('input, select, textarea')).filter(
    (input) => {
      const id = input.id
      const label = id ? document.querySelector(`label[for="${id}"]`) : null
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')
      return !label && !ariaLabel && !ariaLabelledBy && input.type !== 'hidden'
    }
  )
  if (inputsWithoutLabels.length > 0) {
    errors.push({
      type: 'input-no-label',
      message: `Found ${inputsWithoutLabels.length} form inputs without labels`,
    })
  }

  return {
    passed: errors.length === 0,
    errors,
  }
}

/**
 * Run performance tests
 */
export const runPerformanceTests = async () => {
  if (typeof window === 'undefined' || !window.performance) {
    return { passed: false, metrics: {} }
  }

  const perfData = performance.getEntriesByType('navigation')[0]
  const metrics = {}

  if (perfData) {
    metrics.loadTime = perfData.loadEventEnd - perfData.fetchStart
    metrics.ttfb = perfData.responseStart - perfData.fetchStart
    metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart
  }

  // Check Core Web Vitals (if available)
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
  if (lcpEntries.length > 0) {
    metrics.lcp = lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime
  }

  const passed = {
    loadTime: metrics.loadTime < 3000, // 3 seconds
    ttfb: metrics.ttfb < 600, // 600ms
    lcp: !metrics.lcp || metrics.lcp < 2500, // 2.5 seconds
  }

  return {
    passed: Object.values(passed).every(Boolean),
    metrics,
    checks: passed,
  }
}

/**
 * Generate testing report
 */
export const generateTestingReport = async () => {
  const [a11yResults, perfResults] = await Promise.all([
    runAutomatedA11yTests(),
    runPerformanceTests(),
  ])

  return {
    timestamp: new Date().toISOString(),
    accessibility: a11yResults,
    performance: perfResults,
    checklist: TESTING_CHECKLIST,
  }
}

export default {
  TESTING_CHECKLIST,
  runAutomatedA11yTests,
  runPerformanceTests,
  generateTestingReport,
}

