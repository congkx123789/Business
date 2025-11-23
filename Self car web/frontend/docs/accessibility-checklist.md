# Accessibility Checklist & Test Pass

This document outlines the accessibility requirements and test pass criteria for the SelfCar frontend application. All components and pages should meet WCAG 2.1 Level AA standards.

## Overview

This checklist is used during development and testing to ensure accessibility compliance. It covers:
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast
- Form semantics
- ARIA attributes
- Error handling

## General Requirements

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible (2px outline minimum)
- [ ] No keyboard traps
- [ ] Skip links are available for main content
- [ ] Modals trap focus and restore focus on close

### Screen Reader Support
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] ARIA labels are used when visible labels aren't sufficient
- [ ] Landmarks are properly identified (header, nav, main, footer)
- [ ] Error messages are announced to screen readers
- [ ] Status changes are announced (aria-live regions)

### Color & Contrast
- [ ] Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] Color is not the only means of conveying information
- [ ] Focus states are visible on all backgrounds
- [ ] Error states are indicated by more than color alone

### Form Accessibility
- [ ] All form fields have visible labels
- [ ] Labels are programmatically associated with inputs (`htmlFor`/`for` attribute)
- [ ] Required fields are clearly indicated
- [ ] Error messages are associated with their fields (`aria-describedby`)
- [ ] Error messages are clear and actionable
- [ ] Placeholder text is not used as a label
- [ ] Input types are appropriate (`email`, `tel`, `password`, etc.)

## Page-Specific Checklists

### Login Page
- [ ] Email input has `type="email"` and proper label
- [ ] Password input has `type="password"` and proper label
- [ ] Submit button has descriptive text
- [ ] Error messages are announced and associated with fields
- [ ] OAuth buttons have descriptive text
- [ ] "Sign up" link is keyboard accessible
- [ ] Form can be submitted via keyboard (Enter key)

### Register Page
- [ ] All form fields have labels and proper input types
- [ ] Password confirmation validation error is announced
- [ ] Form validation errors are clear and actionable
- [ ] Required fields are indicated
- [ ] "Sign in" link is keyboard accessible

### Home Page
- [ ] All CTA buttons are keyboard accessible
- [ ] Images have descriptive alt text
- [ ] Statistics are readable by screen readers
- [ ] Feature cards have proper heading hierarchy

### Cars Page
- [ ] Search input has proper label
- [ ] Filter dropdowns have labels
- [ ] Car cards are keyboard accessible (can navigate to detail page)
- [ ] "Book Now" buttons are keyboard accessible
- [ ] Empty state message is clear
- [ ] Filter results are announced

### Booking Page
- [ ] Date pickers are keyboard accessible
- [ ] Form validation errors are announced
- [ ] Payment form fields have proper labels
- [ ] Confirmation messages are announced

## Component-Specific Checklists

### Navbar
- [ ] Logo link has descriptive alt text or aria-label
- [ ] Navigation links are keyboard accessible
- [ ] Mobile menu button has aria-label
- [ ] Mobile menu is keyboard accessible
- [ ] Active navigation item is indicated
- [ ] Unread message count is announced

### CarCard
- [ ] Card is keyboard accessible (Link or button)
- [ ] Image has descriptive alt text
- [ ] "Book Now" button is keyboard accessible
- [ ] Featured badge is announced (aria-label or screen reader text)
- [ ] Availability status is announced

### Modal
- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Modal has `aria-labelledby` pointing to title
- [ ] Focus is trapped inside modal
- [ ] ESC key closes modal
- [ ] Focus is restored to trigger element on close
- [ ] Backdrop click is properly handled
- [ ] Close button has aria-label

### Forms (CarFilters, etc.)
- [ ] All inputs have labels
- [ ] Select dropdowns have labels
- [ ] Search input has proper type and label
- [ ] "Clear" button has descriptive text
- [ ] "Apply Filters" button is keyboard accessible

### Error Boundaries
- [ ] Error messages are announced
- [ ] Retry button is keyboard accessible
- [ ] Error state has proper heading hierarchy

## Automated Testing

### Axe Core Tests
Run accessibility tests with:
```bash
npm run test:accessibility
```

All tests should pass with zero violations for:
- Keyboard navigation
- ARIA attributes
- Color contrast (where detectable)
- Form labels
- Image alt text

### Playwright Accessibility Tests
```bash
npm run test:e2e
```

Tests verify:
- Keyboard navigation works
- Focus indicators are visible
- Form fields are accessible
- Screen reader announcements work

### Manual Testing Checklist

#### Keyboard Testing
1. [ ] Tab through entire page - focus order is logical
2. [ ] Shift+Tab works in reverse
3. [ ] Enter/Space activates buttons and links
4. [ ] ESC closes modals and dropdowns
5. [ ] Arrow keys navigate within components (carousels, etc.)

#### Screen Reader Testing (NVDA/JAWS/VoiceOver)
1. [ ] Page structure is announced correctly
2. [ ] Navigation is clear
3. [ ] Form fields are properly labeled
4. [ ] Error messages are announced
5. [ ] Status changes are announced

#### Focus Testing
1. [ ] Focus indicators are visible on all focusable elements
2. [ ] Focus doesn't disappear into hidden elements
3. [ ] Focus is restored after modal close
4. [ ] Focus is trapped in modals

#### Color Contrast Testing
Use tools like:
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- axe DevTools

1. [ ] All text meets 4.5:1 contrast ratio
2. [ ] Large text (18pt+) meets 3:1 contrast ratio
3. [ ] Focus indicators meet contrast requirements

## Test Pass Criteria

### Must Pass (Blocking)
- Zero critical accessibility violations (axe-core)
- All keyboard navigation works
- All form fields have labels
- All images have alt text
- Focus indicators are visible
- Modal focus management works

### Should Pass (Non-blocking but required for production)
- All WCAG 2.1 AA criteria met
- Screen reader testing passes
- Color contrast meets requirements
- ARIA attributes are correct

## Testing Tools

### Automated
- **axe-core**: `npm run test:accessibility`
- **Playwright**: `npm run test:e2e`
- **Storybook a11y addon**: Built into Storybook

### Manual
- **NVDA** (Windows): Free screen reader
- **VoiceOver** (macOS/iOS): Built-in screen reader
- **JAWS** (Windows): Commercial screen reader
- **Chrome DevTools Lighthouse**: Accessibility audit
- **axe DevTools**: Browser extension

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Notes

- All new components should be tested for accessibility before merging
- Accessibility violations should be fixed before visual regression tests pass
- Focus states should be tested on all interactive elements
- Form validation errors should be tested with screen readers

## Review Process

1. Developer completes component/page
2. Run automated accessibility tests
3. Manual keyboard testing
4. Manual screen reader testing (if time permits)
5. Review against this checklist
6. Fix any violations
7. Re-test
8. Mark as complete in checklist

---

**Last Updated**: Month 2 - Design System & A11y Phase
**Status**: ✅ Active Checklist
**Owner**: Frontend Team

