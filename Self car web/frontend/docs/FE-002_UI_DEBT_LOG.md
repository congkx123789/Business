# FE-002: UI Debt Log

## Spacing Issues

### Current State
- ✅ 8pt grid system defined in tokens
- ⚠️ Inconsistent spacing usage across components
- ⚠️ Some components use arbitrary spacing values

### Issues Found
1. **Header**: Uses `space-x-4` (16px) - correct, but could use token
2. **Card components**: Mix of `p-4`, `p-6` - should standardize
3. **Form components**: Inconsistent `gap-2` vs `gap-4`
4. **Mobile nav**: Good spacing (56px touch targets)

### Fixes Needed
- [ ] Audit all components for 8pt grid compliance
- [ ] Replace arbitrary spacing with token values
- [ ] Create spacing utility classes if needed

---

## Contrast Issues

### Current State
- ✅ Color tokens defined with WCAG AA compliance
- ⚠️ Some text colors may not meet contrast requirements
- ⚠️ Dark mode contrast needs verification

### Issues Found
1. **Secondary text**: `text-gray-600` on `bg-gray-50` - 4.8:1 ✅
2. **Tertiary text**: `text-gray-500` on white - 4.2:1 ✅
3. **Disabled text**: `text-gray-400` - may need enhancement
4. **Dark mode**: Needs comprehensive audit

### Fixes Needed
- [ ] Run contrast audit on all text/background combinations
- [ ] Fix any contrast ratios below 4.5:1
- [ ] Enhance disabled state visibility
- [ ] Verify dark mode contrast

---

## Typography Issues

### Current State
- ✅ Typography scale defined in tokens
- ⚠️ Inconsistent font weight usage
- ⚠️ Line height could be more consistent

### Issues Found
1. **Headings**: Mix of `font-bold` and `font-semibold`
2. **Body text**: Sometimes `font-medium`, sometimes `font-normal`
3. **Line height**: Not always using token values
4. **Letter spacing**: Not consistently applied

### Fixes Needed
- [ ] Standardize heading font weights
- [ ] Use typography tokens consistently
- [ ] Apply proper line heights
- [ ] Add letter spacing where appropriate

---

## Iconography Issues

### Current State
- ✅ Lucide React icons library integrated
- ⚠️ Inconsistent icon sizes
- ⚠️ No icon sizing rules defined

### Issues Found
1. **Icon sizes**: Mix of `size={18}`, `size={20}`, `size={24}`
2. **No sizing system**: Arbitrary sizes
3. **Color usage**: Icons sometimes hardcoded colors
4. **Accessibility**: Some icons missing `aria-label`

### Fixes Needed
- [ ] Define icon sizing system (FE-012)
- [ ] Create icon size constants
- [ ] Standardize icon colors
- [ ] Add aria-labels to all icons

---

## Component Consistency

### Current State
- ✅ Foundation components exist (Button, Input, etc.)
- ⚠️ Some components don't use foundation components
- ⚠️ Inconsistent styling patterns

### Issues Found
1. **Buttons**: Some use `Button` component, others use `button` element
2. **Inputs**: Mix of `Input` component and native inputs
3. **Cards**: No standardized card component
4. **Modals**: Styling varies across modals

### Fixes Needed
- [ ] Audit all components for foundation usage
- [ ] Create standardized card component
- [ ] Standardize modal styling
- [ ] Update legacy components

---

## Accessibility Issues

### Current State
- ✅ ARIA attributes used in foundation components
- ⚠️ Not all components have proper ARIA
- ⚠️ Keyboard navigation needs improvement

### Issues Found
1. **Missing labels**: Some inputs missing labels
2. **Focus management**: Some modals don't trap focus
3. **Keyboard shortcuts**: No keyboard shortcuts defined
4. **Screen reader**: Some dynamic content not announced

### Fixes Needed
- [ ] Add labels to all inputs (FE-020)
- [ ] Implement focus traps for modals
- [ ] Add keyboard shortcuts
- [ ] Improve screen reader announcements

---

## Dark Mode Issues

### Current State
- ✅ Dark mode system implemented
- ⚠️ Some components not fully dark mode compatible
- ⚠️ Color contrast in dark mode needs verification

### Issues Found
1. **Hardcoded colors**: Some components use hardcoded colors
2. **Image backgrounds**: Some images don't work in dark mode
3. **Shadows**: Some shadows too subtle in dark mode
4. **Borders**: Some borders invisible in dark mode

### Fixes Needed
- [ ] Audit all components for dark mode
- [ ] Replace hardcoded colors with tokens
- [ ] Enhance dark mode shadows
- [ ] Fix border visibility

---

## Performance Issues

### Current State
- ✅ Code splitting implemented
- ✅ Image optimization exists
- ⚠️ Some components could be optimized

### Issues Found
1. **Large bundles**: Some components import entire libraries
2. **Unused CSS**: Some Tailwind classes not used
3. **Animation performance**: Some animations could be optimized
4. **Image loading**: Some images not lazy loaded

### Fixes Needed
- [ ] Audit bundle sizes
- [ ] Remove unused CSS
- [ ] Optimize animations
- [ ] Ensure all images lazy loaded

---

## Priority Matrix

### High Priority (Week 1-2)
1. **Spacing consistency** - Affects visual harmony
2. **Contrast audit** - Legal/accessibility requirement
3. **Icon sizing system** - Prevents inconsistency
4. **Component ARIA** - Accessibility requirement

### Medium Priority (Week 3-4)
1. **Typography consistency** - Visual polish
2. **Dark mode fixes** - User experience
3. **Component standardization** - Developer experience

### Low Priority (Week 5+)
1. **Performance optimizations** - Nice to have
2. **Keyboard shortcuts** - Power user feature

---

## Tracking

### Fixed Issues
- [ ] Spacing audit complete
- [ ] Contrast audit complete
- [ ] Typography audit complete
- [ ] Icon sizing system implemented
- [ ] Component ARIA audit complete
- [ ] Dark mode audit complete

### Remaining Issues
- Track in GitHub issues or project management tool
- Assign to specific tickets (FE-010, FE-011, etc.)
- Review weekly during sprint planning

