/**
 * Vite Plugin: SSR Locale Injection
 * 
 * Injects detected locale from Accept-Language header into HTML
 * This enables SSR-style locale detection for Vite SPA
 * 
 * Usage: Add to vite.config.js plugins array
 */

export function localeInjectionPlugin() {
  return {
    name: 'locale-injection',
    transformIndexHtml(html) {
      // Inject a script that will detect locale from Accept-Language
      // and inject it into a meta tag before React loads
      const localeScript = `
    <script>
      (function() {
        // Get Accept-Language from browser (available in JS)
        const acceptLanguage = navigator.language || navigator.userLanguage || 'en';
        const supportedLocales = ['en', 'en-US', 'th', 'th-TH'];
        
        // Try to match exact locale
        let detectedLocale = 'en';
        if (supportedLocales.includes(acceptLanguage)) {
          detectedLocale = acceptLanguage;
        } else {
          // Try language code match
          const langCode = acceptLanguage.split('-')[0].toLowerCase();
          const matched = supportedLocales.find(loc => 
            loc.toLowerCase().startsWith(langCode)
          );
          if (matched) {
            detectedLocale = matched;
          }
        }
        
        // Inject meta tag with detected locale
        const meta = document.createElement('meta');
        meta.name = 'detected-locale';
        meta.content = detectedLocale;
        document.head.appendChild(meta);
        
        // Also set html lang attribute
        document.documentElement.lang = detectedLocale.split('-')[0];
      })();
    </script>`
      
      // Insert before closing head tag
      return html.replace('</head>', `${localeScript}\n  </head>`)
    },
  }
}

