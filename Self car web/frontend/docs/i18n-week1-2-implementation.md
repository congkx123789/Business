# i18n Implementation - Weeks 1-2

## Overview
This document summarizes the i18n implementation for Weeks 1-2 of the 8-week roadmap, focusing on i18n configuration, preferences store, CLDR support, and automatic language detection.

## Week 1 Deliverables ✅

### 1. i18n Stack Configuration
- **Stack**: react-i18next + i18next-browser-languagedetector
- **Location**: `frontend/src/i18n/config.js`
- **Features**:
  - Namespaces per domain (common, home, cars, booking, checkout, auth, admin, errors, loading)
  - BCP-47 locale support (en, en-US, th, th-TH)
  - Automatic language detection (cookie, URL param, localStorage, navigator, htmlTag)

### 2. Supported Locales with BCP-47 Tags
- **Location**: `frontend/src/types/preferences.ts`
- **Locales**:
  - `en` / `en-US`: English (US) - USD currency
  - `th` / `th-TH`: Thai (Thailand) - THB currency
- **Default**: `en` with USD currency
- **Currency Mapping**: Automatically maps locale to currency (th/th-TH → THB)

### 3. Preferences Store
- **Location**: `frontend/src/store/preferencesStore.ts`
- **TypeScript Types**: `frontend/src/types/preferences.ts`
- **Features**:
  - Theme (light, dark, system)
  - Locale (en, en-US, th, th-TH)
  - Currency (USD, THB)
  - Units (metric, imperial)
  - Reduced motion (boolean)
  - High contrast (boolean)
- **Persistence**: Zustand with localStorage persistence

### 4. CLDR Data Support
- **Location**: `frontend/src/utils/cldr.js`
- **Features**:
  - Date formatting with locale-aware formats
  - Time formatting with 12/24 hour support
  - Number formatting with locale-specific separators
  - Currency formatting with locale-specific symbols
  - Plural rules using Intl.PluralRules
  - Relative time formatting (e.g., "2 hours ago")
  - Currency symbol extraction

## Week 2 Deliverables ✅

### 1. Automatic Language Detection
- **Location**: `frontend/src/i18n/config.js` and `frontend/src/hooks/useLocaleInit.js`
- **Detection Order**:
  1. URL parameter (`?locale=th-TH`)
  2. Cookie (`i18nextLng`)
  3. localStorage (preferences store)
  4. Browser Accept-Language header
  5. Default (`en`)
- **Persistence**: Cookie (1 year) + localStorage (preferences store)

### 2. ICU MessageFormat Support
- **Location**: `frontend/src/utils/icuMessageFormat.js`
- **Features**:
  - Plural formatting (`{count, plural, =0 {No items} =1 {One item} other {# items}}`)
  - Gender formatting (`{gender, select, male {He} female {She} other {They}}`)
  - Variable substitution (`{name}, {count, number}`)
  - Combined ICU formatting

### 3. LocaleLink Component
- **Location**: `frontend/src/components/Locale/LocaleLink.jsx`
- **Features**:
  - Preserves locale in URL automatically
  - Handles locale prefixes in routes
  - Preserves query string and hash
  - Works with React Router

### 4. Language Switching
- **Location**: `frontend/src/components/Locale/LocaleSwitcher.jsx`
- **Features**:
  - Instant UI updates on language change
  - Persists to preferences store (localStorage)
  - Updates URL with locale parameter
  - Survives page refresh
  - Survives route changes

## Translation Files Structure

### Namespace Organization
```
frontend/src/i18n/locales/
├── en/
│   ├── common.json    (app name, nav, shared)
│   ├── home.json      (home page)
│   ├── cars.json      (car browsing)
│   ├── booking.json   (booking flow)
│   ├── checkout.json  (payment)
│   ├── auth.json      (authentication)
│   ├── admin.json     (admin dashboard)
│   ├── errors.json    (error messages)
│   └── loading.json   (loading states)
└── th/
    └── (same structure)
```

## Usage Examples

### Using Translations
```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('cars') // Use 'cars' namespace
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  )
}
```

### Using LocaleLink
```jsx
import LocaleLink from '../components/Locale/LocaleLink'

<LocaleLink to="/cars">Cars</LocaleLink>
```

### Using Locale Hook
```jsx
import { useLocale } from '../hooks/useLocale'

function MyComponent() {
  const { formatPrice, formatDate, formatRelativeTime } = useLocale()
  
  return (
    <div>
      <p>Price: {formatPrice(1000)}</p>
      <p>Date: {formatDate(new Date())}</p>
      <p>Time: {formatRelativeTime(new Date())}</p>
    </div>
  )
}
```

### Using Preferences Store
```jsx
import { usePreferencesStore } from '../store/preferencesStore'

function MyComponent() {
  const { locale, currency, theme, setLocale, setTheme } = usePreferencesStore()
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <p>Current currency: {currency}</p>
      <button onClick={() => setLocale('th-TH')}>Switch to Thai</button>
    </div>
  )
}
```

### Using ICU MessageFormat
```jsx
import { formatPlural, formatMessage } from '../utils/icuMessageFormat'

// Plural
const message = formatPlural('{count, plural, =0 {No items} =1 {One item} other {# items}}', 5)
// Returns: "5 items"

// With variables
const message = formatMessage('Hello {name}, you have {count, number} messages', { 
  name: 'John', 
  count: 5 
})
// Returns: "Hello John, you have 5 messages"
```

## Acceptance Criteria ✅

### Week 2 AC: "Changing language updates UI instantly, persists on refresh, and survives route changes"

✅ **Instant UI Updates**: 
- Language change triggers immediate i18n language change
- React components re-render with new translations
- Currency formatting updates automatically

✅ **Persists on Refresh**:
- Locale stored in localStorage (preferences store)
- Cookie set for 1 year
- i18n config detects and loads saved locale on page load

✅ **Survives Route Changes**:
- LocaleLink preserves locale in URL
- LocaleSwitcher updates URL with locale parameter
- useLocaleInit hook syncs locale on route changes

## Files Created/Modified

### New Files
- `frontend/src/types/preferences.ts` - TypeScript types for preferences
- `frontend/src/store/preferencesStore.ts` - Zustand preferences store
- `frontend/src/utils/cldr.js` - CLDR utilities for formatting
- `frontend/src/utils/icuMessageFormat.js` - ICU MessageFormat support
- `frontend/src/components/Locale/LocaleLink.jsx` - Locale-aware Link component
- `frontend/src/hooks/useLocaleInit.js` - Locale initialization hook
- `frontend/src/i18n/locales/en/*.json` - English translations by namespace
- `frontend/src/i18n/locales/th/*.json` - Thai translations by namespace

### Modified Files
- `frontend/src/i18n/config.js` - Enhanced with namespaces and BCP-47 support
- `frontend/src/components/Locale/LocaleSwitcher.jsx` - Integrated with preferences store
- `frontend/src/hooks/useLocale.js` - Integrated with preferences and CLDR
- `frontend/src/App.jsx` - Added locale initialization

## Next Steps (Weeks 3-8)

- Week 3: Theme switching and preferences UI
- Week 4: Currency conversion and exchange rates
- Week 5: Advanced formatting (units, measurements)
- Week 6: Accessibility (reduced motion, high contrast)
- Week 7: Performance optimization (lazy loading translations)
- Week 8: Testing and documentation

## Notes

- All translations are split into namespaces for better organization
- CLDR utilities use native Intl API (no external dependencies)
- ICU MessageFormat is a basic implementation (can be enhanced with @formatjs/intl-messageformat)
- Preferences store persists across sessions
- Locale detection works with multiple sources (URL, cookie, localStorage, browser)

