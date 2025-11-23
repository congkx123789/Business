import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Mock i18n to return readable strings and provide changeLanguage
const i18nDict = {
  // Cars & booking
  'common.cars.bookNow': 'Book Now',
  'common.cars.unavailable': 'Unavailable',
  'common.cars.found': 'Found',
  'common.cars.cars': 'cars',
  'common.cars.savedSearches': 'Saved Searches',
  'common.cars.saveSearch': 'Save Search',
  'common.cars.recentSearches': 'Recent Searches',
  'common.booking.perDay': '/day',

  // Navbar
  'common.nav.main': 'Main navigation',
  'common.nav.home': 'Home',
  'common.nav.cars': 'Cars',
  'common.nav.login': 'Login',
  'common.nav.register': 'Sign Up',
  'common.nav.profile': 'Profile',
  'common.nav.logout': 'Logout',
  'common.nav.dashboard': 'Dashboard',

  // Footer
  'common.footer.securePayment': 'Secure Payment',
  'common.footer.securePaymentDesc': 'SSL encrypted transactions',
  'common.footer.verifiedSellers': 'Verified Sellers',
  'common.footer.verifiedSellersDesc': 'All sellers verified',
  'common.footer.returnPolicy': 'Return Policy',
  'common.footer.returnPolicyDesc': '7-day return guarantee',
  'common.footer.cancellationPolicy': 'Cancellation Policy',
  'common.footer.cancellationPolicyDesc': 'Free cancellation up to 24h',
  'common.footer.help': 'Help & Support',
  'common.footer.helpCenter': 'Help Center',
  'common.footer.contactUs': 'Contact Us',
  'common.footer.faq': 'FAQ',
  'common.footer.guides': 'Buying Guides',
  'common.footer.policies': 'Policies',
  'common.footer.terms': 'Terms & Conditions',
  'common.footer.privacy': 'Privacy Policy',
  'common.footer.language': 'Language',
  'common.footer.allRightsReserved': 'All rights reserved.',

  // Home page
  'common.home.title': 'Find Your Perfect Car',
  'common.home.subtitle': 'Rent premium vehicles with ease and confidence',
  'common.home.browseCars': 'Browse Cars',
  'common.home.featured': 'Featured',
  'common.home.signUp': 'Sign Up',
}

vi.mock('react-i18next', async () => {
  return {
    useTranslation: () => ({
      t: (key) => i18nDict[key] || key,
      i18n: {
        language: 'en',
        changeLanguage: () => Promise.resolve(),
      },
    }),
    Trans: ({ children }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  }
})

// Mock auth hooks to avoid real network and complex side-effects in unit tests
vi.mock('../hooks/useAuth', () => {
  return {
    useLogin: () => ({
      isPending: false,
      data: { user: { role: 'CUSTOMER' } },
      mutateAsync: vi.fn().mockResolvedValue({ user: { role: 'CUSTOMER' }, token: 'test' }),
    }),
    useRegister: () => ({
      isPending: false,
      data: { user: { role: 'CUSTOMER' } },
      mutateAsync: vi.fn().mockResolvedValue({ user: { role: 'CUSTOMER' }, token: 'test' }),
    }),
    useCurrentUser: () => ({ data: null }),
    authQueryKeys: { all: ['auth'], me: () => ['auth', 'me'] },
  }
})

// Establish API mocking before all tests
beforeAll(() => {
  if (server && typeof server.listen === 'function') {
    server.listen({ onUnhandledRequest: 'error' })
  }
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  if (server && typeof server.resetHandlers === 'function') {
    server.resetHandlers()
  }
})

// Clean up after the tests are finished
afterAll(() => {
  if (server && typeof server.close === 'function') {
    server.close()
  }
})

// Global test setup
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock scrollTo
window.HTMLElement.prototype.scrollIntoView = () => {};

// Mock navigation to avoid JSDOM "navigation to another Document" errors
// Tests should assert calls instead of real navigation side-effects
// eslint-disable-next-line no-undef
if (typeof window !== 'undefined') {
  try {
    // In case location is read-only in current JSDOM, replace safely
    const loc = {
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      href: ''
    }
    Object.defineProperty(window, 'location', {
      value: loc,
      writable: true,
    })
  } catch (_) {
    // Fallback no-op
  }
}
