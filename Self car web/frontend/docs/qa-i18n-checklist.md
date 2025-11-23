# QA Checklist for i18n - Date/Number Formats

## Overview

This checklist ensures date and number formats are correctly displayed across all locales and markets.

## Pre-Release Checklist

### Date Formats

#### English (en-US)
- [ ] Dates display in MM/DD/YYYY format
- [ ] Dates display in "January 15, 2024" format (long format)
- [ ] Dates display in "Jan 15, 2024" format (short format)
- [ ] Time displays in 12-hour format (AM/PM)
- [ ] Time displays in 24-hour format (when applicable)
- [ ] Date ranges display correctly (e.g., "Jan 15 - Jan 20, 2024")
- [ ] Relative dates display correctly (e.g., "2 days ago", "in 3 days")
- [ ] Calendar dates display correctly in date pickers
- [ ] Booking dates display correctly in booking summary

#### Thai (th-TH)
- [ ] Dates display in DD/MM/YYYY format
- [ ] Dates display in "15 มกราคม 2567" format (Thai Buddhist calendar)
- [ ] Dates display in "15 ม.ค. 2567" format (short format)
- [ ] Time displays in 24-hour format
- [ ] Date ranges display correctly (e.g., "15 ม.ค. - 20 ม.ค. 2567")
- [ ] Relative dates display correctly (Thai translations)
- [ ] Calendar dates display correctly in date pickers
- [ ] Booking dates display correctly in booking summary

### Number Formats

#### English (en-US)
- [ ] Numbers display with comma separators (e.g., 1,234.56)
- [ ] Numbers display with period as decimal separator
- [ ] Currency displays as $1,234.56 (USD)
- [ ] Large numbers display correctly (e.g., 1,000,000)
- [ ] Percentages display correctly (e.g., 45.5%)
- [ ] Phone numbers display correctly (e.g., +1 (555) 123-4567)
- [ ] Prices display correctly (e.g., $50.00/day)

#### Thai (th-TH)
- [ ] Numbers display with comma separators (e.g., 1,234.56)
- [ ] Numbers display with period as decimal separator
- [ ] Currency displays as ฿1,234.56 (THB)
- [ ] Large numbers display correctly (e.g., 1,000,000)
- [ ] Percentages display correctly (e.g., 45.5%)
- [ ] Phone numbers display correctly (e.g., +66 2 123 4567)
- [ ] Prices display correctly (e.g., ฿1,750.00/วัน)

### Currency Formats

#### English (USD)
- [ ] Currency symbol displays as $ (before amount)
- [ ] Currency code displays as USD (when applicable)
- [ ] Prices display as $50.00
- [ ] Prices display as $1,234.56
- [ ] Zero amounts display as $0.00
- [ ] Negative amounts display as -$50.00
- [ ] Exchange rate conversion displays correctly
- [ ] Currency switcher updates prices correctly

#### Thai (THB)
- [ ] Currency symbol displays as ฿ (before amount)
- [ ] Currency code displays as THB (when applicable)
- [ ] Prices display as ฿1,750.00 (35 THB = 1 USD example)
- [ ] Prices display as ฿43,234.56
- [ ] Zero amounts display as ฿0.00
- [ ] Negative amounts display as -฿1,750.00
- [ ] Exchange rate conversion displays correctly
- [ ] Currency switcher updates prices correctly

### Component-Specific Checks

#### CarCard Component
- [ ] Price displays correctly in car card
- [ ] Price updates when locale changes
- [ ] "Per day" text translates correctly
- [ ] "Featured" badge translates correctly
- [ ] "Unavailable" badge translates correctly
- [ ] "Book Now" button translates correctly

#### Booking Component
- [ ] Date pickers display correct format
- [ ] Date validation works correctly
- [ ] Total price displays correctly
- [ ] Price per day displays correctly
- [ ] Number of days displays correctly
- [ ] Booking summary dates display correctly

#### Checkout Component
- [ ] Total price displays correctly
- [ ] Currency symbol displays correctly
- [ ] Exchange rate conversion displays correctly
- [ ] Payment amounts display correctly

#### Admin Components
- [ ] Revenue displays correctly
- [ ] Statistics display correctly
- [ ] Charts display correctly (if applicable)
- [ ] Reports display correctly (if applicable)

### Market-Specific Checks

#### US Market (en)
- [ ] All US date formats display correctly
- [ ] All US number formats display correctly
- [ ] USD currency displays correctly
- [ ] US phone number formats display correctly

#### Thai Market (th)
- [ ] All Thai date formats display correctly
- [ ] All Thai number formats display correctly
- [ ] THB currency displays correctly
- [ ] Thai phone number formats display correctly
- [ ] Thai text displays correctly (no font issues)
- [ ] Thai text alignment displays correctly

### Exchange Rate Checks

- [ ] Exchange rates fetch from backend correctly
- [ ] Exchange rates update when locale changes
- [ ] Prices convert correctly using exchange rates
- [ ] Exchange rate caching works correctly
- [ ] Exchange rate errors handle gracefully

### Locale Switcher Checks

- [ ] Locale switcher displays correctly
- [ ] Locale changes update all components
- [ ] Currency updates when locale changes
- [ ] Translations update when locale changes
- [ ] Date formats update when locale changes
- [ ] Number formats update when locale changes
- [ ] Locale preference persists in localStorage

### Edge Cases

- [ ] Zero values display correctly
- [ ] Negative values display correctly
- [ ] Very large numbers display correctly
- [ ] Very small numbers display correctly
- [ ] Invalid dates handle gracefully
- [ ] Invalid numbers handle gracefully
- [ ] Missing exchange rates handle gracefully
- [ ] Network errors handle gracefully

### Performance Checks

- [ ] Locale switching is fast (< 100ms)
- [ ] Currency conversion is fast (< 50ms)
- [ ] Exchange rate fetching is efficient
- [ ] No unnecessary re-renders on locale change
- [ ] Translations load efficiently

### Accessibility Checks

- [ ] Date/number formats are readable by screen readers
- [ ] Currency symbols are announced correctly
- [ ] Locale switcher is keyboard accessible
- [ ] Locale switcher has proper ARIA labels
- [ ] Date pickers are accessible

### Browser Compatibility

- [ ] Chrome - Date/number formats display correctly
- [ ] Firefox - Date/number formats display correctly
- [ ] Safari - Date/number formats display correctly
- [ ] Edge - Date/number formats display correctly
- [ ] Mobile browsers - Date/number formats display correctly

## Testing Checklist

### Manual Testing

1. [ ] Switch locale to English (en)
   - [ ] Verify all dates display in US format
   - [ ] Verify all numbers display in US format
   - [ ] Verify currency displays as USD
   - [ ] Verify all prices display correctly

2. [ ] Switch locale to Thai (th)
   - [ ] Verify all dates display in Thai format
   - [ ] Verify all numbers display in Thai format
   - [ ] Verify currency displays as THB
   - [ ] Verify all prices display correctly (converted)
   - [ ] Verify Thai text displays correctly

3. [ ] Test currency conversion
   - [ ] Verify prices convert correctly
   - [ ] Verify exchange rates update correctly
   - [ ] Verify cached exchange rates work

4. [ ] Test date pickers
   - [ ] Verify date formats display correctly
   - [ ] Verify date validation works
   - [ ] Verify date ranges display correctly

5. [ ] Test number formatting
   - [ ] Verify large numbers format correctly
   - [ ] Verify decimal numbers format correctly
   - [ ] Verify percentages format correctly

### Automated Testing

- [ ] Unit tests for currency formatting
- [ ] Unit tests for date formatting
- [ ] Unit tests for number formatting
- [ ] Integration tests for locale switching
- [ ] E2E tests for locale switching
- [ ] E2E tests for currency conversion

## Known Issues

- [ ] List any known issues here

## Notes

- Date formats use Intl.DateTimeFormat
- Number formats use Intl.NumberFormat
- Currency formats use Intl.NumberFormat with currency style
- Exchange rates are cached on backend
- Locale preference is stored in localStorage

---

**Last Updated**: Month 5 - Internationalization
**Status**: ✅ Active Checklist
**Owner**: Frontend Team

