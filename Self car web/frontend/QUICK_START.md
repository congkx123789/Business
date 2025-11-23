# Quick Start Guide - Frontend Modernization

## 🚀 Installation

```bash
cd frontend
npm install zod @hookform/resolvers
```

## 📦 Key Components

### Foundation Components
```jsx
import { Button, Input, Select, Checkbox, Radio, Switch, Tooltip, Toast, Skeleton } from './components/Foundation'

// Button variants
<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Form inputs with validation
<FormInput name="email" label="Email" type="email" />
<FormSelect name="country" label="Country" options={[...]} />
```

### Layout Components
```jsx
import Header from './components/Layout/Header'
import MobileNav from './components/Layout/MobileNav'
import Footer from './components/Layout/Footer'
```

### Car Components
```jsx
import ImageGallery from './components/Cars/ImageGallery'
import StickyCTA from './components/Cars/StickyCTA'
import SpecsAccordion from './components/Cars/SpecsAccordion'
import SellerCard from './components/Cars/SellerCard'
```

### Forms with Validation
```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from './utils/validation'
import { FormInput } from './components/Forms'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
})
```

## 🎨 Using Design Tokens

```jsx
import { tokens } from './design-tokens/tokens'

// Spacing (8pt grid)
className="p-2" // 16px (2 * 8px)

// Colors
className="bg-primary-500 text-white"

// Shadows
className="shadow-elevation-2"

// Focus ring
className="focus-ring"
```

## 🌓 Theme System

```jsx
import { useTheme } from './components/Theme/ThemeProvider'
import { usePreferencesStore } from './store/preferencesStore'

const { theme, setTheme } = usePreferencesStore()
// theme: 'light' | 'dark' | 'system'
```

## 📱 Mobile Navigation

Bottom dock navigation automatically appears on mobile devices. Ensure main content has bottom padding:
```jsx
<main className="pb-16 md:pb-0">
  {/* Content */}
</main>
```

## ✅ Form Validation Example

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from './utils/validation'
import { FormInput, Button } from './components'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        name="email"
        label="Email"
        type="email"
        error={errors.email?.message}
      />
      <FormInput
        name="password"
        label="Password"
        type="password"
        error={errors.password?.message}
      />
      <Button type="submit">Register</Button>
    </form>
  )
}
```

## 🔐 OTP Authentication

```jsx
import OTPInput from './components/Auth/OTPInput'

<OTPInput
  length={6}
  onComplete={handleOTPComplete}
  onResend={handleResendOTP}
  rateLimitSeconds={rateLimitSeconds}
/>
```

## 🖼️ Image Gallery

```jsx
import ImageGallery from './components/Cars/ImageGallery'

<ImageGallery
  images={imagesArray}
  primaryImageIndex={0}
  carName="Toyota Camry"
/>
```

## 🎯 Analytics Events

```jsx
import { trackPDPEvent } from './utils/metrics'

trackPDPEvent('cta_clicked', { carId: car.id, carName: car.name })
```

## 📚 Storybook

```bash
npm run storybook
```

View all components with interactive examples and accessibility tests.

## 🐛 Error Handling

```jsx
import ErrorBoundary from './components/Shared/ErrorBoundary'

<ErrorBoundary maxRetries={3}>
  <YourComponent />
</ErrorBoundary>
```

## 🎨 Customization

All design tokens are in `src/design-tokens/tokens.json`. Update values and rebuild:
```bash
npm run build
```

---

For detailed documentation, see `IMPLEMENTATION_SUMMARY.md`

