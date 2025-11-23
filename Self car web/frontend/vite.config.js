import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeInjectionPlugin } from './vite.plugin.locale.js'

// SRI plugin completely removed - not needed for dev mode
// If needed for production, use: import sri from 'vite-plugin-sri' and use default export

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    localeInjectionPlugin(),
  ],
  // Exclude playwright-report and other build artifacts from scanning
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
      // Externalize optional observability libs if not installed
      external: ['@sentry/react', '@sentry/tracing']
    },
  },
  // Exclude directories from dependency scanning
  optimizeDeps: {
    exclude: ['playwright-report'],
  },
  server: {
    port: 5173,
    headers: {
      // Week 6: Baseline CSP in Report-Only for dev. Nonce injection will be added later.
      // Payment routes have stricter CSP (see payment-specific CSP below)
      'Content-Security-Policy-Report-Only': [
        "default-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "frame-ancestors 'self'",
        // Using strict-dynamic without nonces for dev; refine in Week 7/8
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        `connect-src 'self' http://localhost:8080 ${process.env.VITE_API_URL || ''}`.trim(),
        // Update to provider domains in Week 8 for payments
        "frame-src 'self'",
        'upgrade-insecure-requests',
        'report-to csp-endpoint',
        'report-uri /api/security/csp-report'
      ].join('; ')
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
