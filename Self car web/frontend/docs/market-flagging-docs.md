# Market Flagging Documentation

## Overview

Market flagging system allows feature flags and content slots per market (locale/region). This enables market-specific features and content operations.

## Market Configuration

### Markets

Markets are defined in `frontend/src/features/marketFlags.js`:

```javascript
export const MARKETS = {
  en: {
    code: 'en',
    name: 'English',
    region: 'US',
    currency: 'USD',
    enabled: true,
    features: {
      paymentGateway: 'stripe',
      oauthProviders: ['google', 'github', 'facebook'],
      showPromotions: true,
      showReviews: true,
      showReferral: true,
    },
    contentSlots: {
      heroBanner: 'hero-banner-en',
      promotions: 'promotions-en',
      testimonials: 'testimonials-en',
    },
  },
  th: {
    code: 'th',
    name: 'ไทย',
    region: 'TH',
    currency: 'THB',
    enabled: true,
    features: {
      paymentGateway: 'stripe',
      oauthProviders: ['google', 'github', 'facebook'],
      showPromotions: true,
      showReviews: true,
      showReferral: true,
      showThaiLanguageSupport: true,
      showThaiPaymentMethods: false,
    },
    contentSlots: {
      heroBanner: 'hero-banner-th',
      promotions: 'promotions-th',
      testimonials: 'testimonials-th',
    },
  },
}
```

## Feature Flags

### Checking Feature Flags

Use the `useMarket` hook to check feature flags:

```javascript
import { useMarket } from '../hooks/useMarket'

const MyComponent = () => {
  const { isFeatureEnabled, getFeatureValue } = useMarket()
  
  // Check if feature is enabled
  const showPromotions = isFeatureEnabled('showPromotions')
  
  // Get feature value
  const paymentGateway = getFeatureValue('paymentGateway')
  
  return (
    <div>
      {showPromotions && <Promotions />}
      {paymentGateway === 'stripe' && <StripePayment />}
    </div>
  )
}
```

### Available Features

#### Payment Gateway
- **Key**: `paymentGateway`
- **Values**: `'stripe'`, `'paypal'`, `'momo'`, `'zalopay'`
- **Usage**: Determines which payment gateway to use

```javascript
const paymentGateway = getFeatureValue('paymentGateway')
// Use paymentGateway to initialize correct gateway
```

#### OAuth Providers
- **Key**: `oauthProviders`
- **Values**: Array of provider names (`['google', 'github', 'facebook']`)
- **Usage**: Determines which OAuth providers to show

```javascript
const oauthProviders = getFeatureValue('oauthProviders')
// Filter OAuth buttons based on providers
```

#### Promotions
- **Key**: `showPromotions`
- **Values**: `true` / `false`
- **Usage**: Show/hide promotions section

```javascript
const showPromotions = isFeatureEnabled('showPromotions')
{showPromotions && <PromotionsSection />}
```

#### Reviews
- **Key**: `showReviews`
- **Values**: `true` / `false`
- **Usage**: Show/hide reviews section

```javascript
const showReviews = isFeatureEnabled('showReviews')
{showReviews && <ReviewsSection />}
```

#### Referral
- **Key**: `showReferral`
- **Values**: `true` / `false`
- **Usage**: Show/hide referral program

```javascript
const showReferral = isFeatureEnabled('showReferral')
{showReferral && <ReferralProgram />}
```

#### TH-Specific Features
- **Key**: `showThaiLanguageSupport`
- **Values**: `true` / `false`
- **Usage**: Enable Thai language support

- **Key**: `showThaiPaymentMethods`
- **Values**: `true` / `false`
- **Usage**: Enable Thai payment methods (MoMo, ZaloPay)

## Content Slots

### Getting Content Slots

Use the `useMarket` hook to get content slots:

```javascript
import { useMarket } from '../hooks/useMarket'

const MyComponent = () => {
  const { getContentSlot } = useMarket()
  
  // Get content slot for current market
  const heroBanner = getContentSlot('heroBanner')
  
  return (
    <div>
      <ContentSlot slot={heroBanner} />
    </div>
  )
}
```

### Available Content Slots

#### Hero Banner
- **Key**: `heroBanner`
- **Values**: `'hero-banner-en'`, `'hero-banner-th'`
- **Usage**: Display market-specific hero banner

#### Promotions
- **Key**: `promotions`
- **Values**: `'promotions-en'`, `'promotions-th'`
- **Usage**: Display market-specific promotions

#### Testimonials
- **Key**: `testimonials`
- **Values**: `'testimonials-en'`, `'testimonials-th'`
- **Usage**: Display market-specific testimonials

## Market Information

### Getting Market Info

Use the `useMarket` hook to get market information:

```javascript
import { useMarket } from '../hooks/useMarket'

const MyComponent = () => {
  const { market, locale, currency, region } = useMarket()
  
  return (
    <div>
      <p>Market: {market.name}</p>
      <p>Locale: {locale}</p>
      <p>Currency: {currency}</p>
      <p>Region: {region}</p>
    </div>
  )
}
```

## Adding New Markets

To add a new market:

1. **Add market configuration** in `marketFlags.js`:

```javascript
export const MARKETS = {
  // ... existing markets
  ja: {
    code: 'ja',
    name: '日本語',
    region: 'JP',
    currency: 'JPY',
    enabled: true,
    features: {
      paymentGateway: 'stripe',
      oauthProviders: ['google', 'github'],
      showPromotions: true,
      showReviews: true,
      showReferral: true,
    },
    contentSlots: {
      heroBanner: 'hero-banner-ja',
      promotions: 'promotions-ja',
      testimonials: 'testimonials-ja',
    },
  },
}
```

2. **Add translations** in `frontend/src/i18n/locales/ja.json`

3. **Add currency configuration** in `frontend/src/utils/currency.js`

4. **Update locale switcher** to include new market

5. **Test** the new market thoroughly

## Adding New Features

To add a new feature flag:

1. **Add feature to market configuration**:

```javascript
features: {
  // ... existing features
  showNewFeature: true,
}
```

2. **Use feature in components**:

```javascript
const { isFeatureEnabled } = useMarket()
const showNewFeature = isFeatureEnabled('showNewFeature')
{showNewFeature && <NewFeature />}
```

## Adding New Content Slots

To add a new content slot:

1. **Add slot to market configuration**:

```javascript
contentSlots: {
  // ... existing slots
  newSlot: 'new-slot-en',
}
```

2. **Use slot in components**:

```javascript
const { getContentSlot } = useMarket()
const newSlot = getContentSlot('newSlot')
<ContentSlot slot={newSlot} />
```

## Best Practices

1. **Always check feature flags** before showing market-specific features
2. **Use content slots** for market-specific content
3. **Test all markets** before releasing new features
4. **Document feature flags** in this document
5. **Use market info** for locale-specific logic
6. **Cache market configuration** for performance
7. **Handle missing features gracefully**

## Testing

### Unit Tests

Test feature flags and content slots:

```javascript
import { isFeatureEnabled, getContentSlot } from '../features/marketFlags'

test('showPromotions is enabled for en market', () => {
  expect(isFeatureEnabled('showPromotions', 'en')).toBe(true)
})

test('heroBanner slot is correct for th market', () => {
  expect(getContentSlot('heroBanner', 'th')).toBe('hero-banner-th')
})
```

### Integration Tests

Test market switching and feature updates:

```javascript
test('market switching updates features', async () => {
  const { result } = renderHook(() => useMarket())
  
  await act(async () => {
    await result.current.changeLocale('th')
  })
  
  expect(result.current.isFeatureEnabled('showThaiLanguageSupport')).toBe(true)
})
```

## Troubleshooting

### Feature Not Showing

1. Check if feature is enabled in market configuration
2. Check if market is enabled
3. Check if locale matches market code
4. Check component rendering logic

### Content Slot Not Loading

1. Check if content slot exists in market configuration
2. Check if ContentSlot component is implemented
3. Check if content is loaded from backend
4. Check network requests

### Currency Not Updating

1. Check if currency is configured in market
2. Check if exchange rate is fetched
3. Check if currency formatting is using market currency
4. Check if locale is updated

---

**Last Updated**: Month 5 - Internationalization
**Status**: ✅ Active Documentation
**Owner**: Frontend Team

