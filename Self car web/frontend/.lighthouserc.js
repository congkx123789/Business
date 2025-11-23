/**
 * Lighthouse CI Configuration (FE-102)
 * 
 * Core Web Vitals budgets:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - CLS (Cumulative Layout Shift) < 0.1
 * - INP (Interaction to Next Paint) < 200ms
 */

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Core Web Vitals (FE-102)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // LCP (FE-102)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        
        // CLS (FE-102)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // INP (FE-102) - Note: INP is measured in lab but real INP is field data
        'interactive': ['error', { maxNumericValue: 3800 }], // TTI proxy
        
        // First Contentful Paint
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        
        // Total Blocking Time
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Speed Index
        'speed-index': ['error', { maxNumericValue: 3400 }],
        
        // Bundle size budgets (FE-102)
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 200000 }], // 200KB
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }], // 1MB
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
