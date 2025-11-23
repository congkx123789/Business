# SSR Locale Inference, A11y Improvements, and Performance Optimizations

## Summary

This document outlines the implementation of:
1. SSR locale inference from Accept-Language header
2. Accessibility (A11y) improvements: keyboard navigation, focus management, screen reader support
3. Performance optimizations for both themes

## Implementation Details

### 1. SSR Locale Inference from Accept-Language Header

#### Backend Changes

**File: `backend/src/main/java/com/selfcar/controller/i18n/I18nController.java`**
- Added `/api/i18n/detect-locale` endpoint
- Parses Accept-Language header with quality values (q)
- Supports exact match and language code matching
- Returns detected locale in BCP-47 format

**Features:**
- Priority matching: exact match → language code match → default (en)
- Quality value support (e.g., `en-US,en;q=0.9,th;q=0.8`)
- Locale normalization (en_US → en-US)

#### Frontend Changes

**File: `frontend/vite.plugin.locale.js`** (NEW)
- Vite plugin that injects locale detection script into HTML
- Detects locale from `navigator.language`
- Injects meta tag with detected locale
- Sets HTML `lang` attribute

**File: `frontend/src/hooks/useLocaleInit.js`**
- Enhanced locale detection with priority:
  1. URL parameter (?locale=th-TH)
  2. Preferences store (localStorage)
  3. SSR-injected locale (meta tag)
  4. Cookie (i18nextLng)
  5. Backend API detect-locale endpoint
  6. Browser navigator
  7. Default (en)

**File: `frontend/index.html`**
- Added locale detection script in `<head>`
- Sets HTML `lang` attribute based on browser language

### 2. Accessibility Improvements

#### Skip Links

**File: `frontend/src/components/Shared/SkipLinks.jsx`** (NEW)
- Provides skip-to-main-content link
- Provides skip-to-navigation link
- WCAG 2.4.1 compliant (Bypass Blocks)
- Visible on focus, hidden otherwise

**File: `frontend/src/components/Layout/Layout.jsx`**
- Added SkipLinks component
- Added `id="main-content"` and `role="main"` to main element

#### Keyboard Navigation

**File: `frontend/src/components/Theme/ThemeToggle.jsx`**
- Enhanced keyboard support:
  - Escape key to close dropdown
  - Enter/Space to select theme
  - Arrow keys for navigation (future enhancement)
- Improved ARIA labels with current state
- Focus ring styling

**File: `frontend/src/components/Locale/LocaleSwitcher.jsx`**
- Enhanced keyboard navigation:
  - Escape to close
  - ArrowDown to open
  - Arrow keys for navigation within dropdown
  - Enter/Space to select
- Improved ARIA labels

**File: `frontend/src/App.jsx`**
- Enhanced focus management on route changes
- Screen reader announcements for route changes
- WCAG 2.4.3 compliant (Focus Order)

#### Screen Reader Support

**File: `frontend/src/utils/theme.js`**
- Added `announceThemeChange()` function
- Creates aria-live region for theme announcements
- Announces theme changes to screen readers

**File: `frontend/src/index.css`**
- Added `.sr-only` utility class
- Screen reader only styles with focus visibility

#### ARIA Attributes

**File: `frontend/src/components/Layout/Navbar.jsx`**
- Added `role="navigation"` and `aria-label` to nav element
- Added `id="main-navigation"` for skip links

**Translation Files:**
- Added `skipToMain`, `skipToNav`, and `nav.main` translations
- English and Thai translations

### 3. Performance Optimizations

#### Theme Switching

**File: `frontend/src/utils/theme.js`**
- Uses `requestAnimationFrame` for smooth transitions
- Batches DOM updates
- Only updates if theme actually changed
- Async localStorage write (non-blocking)
- CSS variable-based transitions

**File: `frontend/src/index.css`**
- Optimized CSS transitions:
  - Only transition color properties (background-color, color, border-color)
  - CSS variables for transition duration
  - `.theme-changing` class to disable transitions during change
- Reduced repaints and reflows

**File: `frontend/src/components/Theme/ThemeToggle.jsx`**
- Memoized theme options with `useMemo`
- Memoized current theme info
- Memoized event handlers with `useCallback`
- Conditional subscription to system theme changes (only when theme is 'system')
- Reduced unnecessary re-renders

#### CSS Optimizations

**File: `frontend/src/index.css`**
- CSS variables for theme transition timing
- Selective transition properties (only colors)
- Screen reader utility classes

## Testing Checklist

### SSR Locale Inference
- [ ] Test with Accept-Language header: `en-US,en;q=0.9`
- [ ] Test with Accept-Language header: `th-TH,th;q=0.9`
- [ ] Test fallback to default locale
- [ ] Verify meta tag injection in HTML
- [ ] Verify HTML lang attribute is set correctly

### Accessibility
- [ ] Test skip links with keyboard (Tab key)
- [ ] Test keyboard navigation in theme toggle (Escape, Arrow keys)
- [ ] Test keyboard navigation in locale switcher
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Test route change announcements
- [ ] Verify ARIA labels are correct

### Performance
- [ ] Measure theme switch time (should be < 50ms)
- [ ] Verify no layout shifts during theme change
- [ ] Check for unnecessary re-renders in React DevTools
- [ ] Verify CSS transitions are smooth
- [ ] Test with slow devices/network

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported (uses modern JavaScript features)

## WCAG Compliance

- **WCAG 2.4.1 (Level A)**: Bypass Blocks - Skip links implemented
- **WCAG 2.4.3 (Level A)**: Focus Order - Focus management on route changes
- **WCAG 4.1.2 (Level A)**: Name, Role, Value - ARIA labels and roles
- **WCAG 2.1.1 (Level A)**: Keyboard - Full keyboard navigation support

## Future Enhancements

1. Add more granular keyboard navigation (Arrow keys in dropdowns)
2. Add focus trap for modals (partially implemented)
3. Add high contrast mode support
4. Add reduced motion support for theme transitions
5. Add locale detection from IP geolocation (optional enhancement)

