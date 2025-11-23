import { z } from 'zod'

/**
 * Validation Schemas (FE-080)
 * 
 * Zod schemas for form validation with:
 * - Inline validation patterns
 * - Descriptive error messages
 * - Masked input support
 */

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address')

// Phone validation (US format)
export const phoneSchema = z.string().regex(
  /^\(\d{3}\) \d{3}-\d{4}$/,
  'Please enter a valid phone number (e.g., (555) 123-4567)'
)

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Price validation
export const priceSchema = z
  .string()
  .or(z.number())
  .refine((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return !isNaN(num) && num > 0
  }, 'Please enter a valid price')
  .transform((val) => {
    return typeof val === 'string' ? parseFloat(val) : val
  })

// Date validation
export const dateSchema = z
  .string()
  .or(z.date())
  .refine((val) => {
    const date = typeof val === 'string' ? new Date(val) : val
    return !isNaN(date.getTime())
  }, 'Please enter a valid date')
  .transform((val) => {
    return typeof val === 'string' ? new Date(val) : val
  })

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Registration form schema
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Contact/Lead form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().min(1, 'Message is required').min(10, 'Message must be at least 10 characters'),
  carId: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'both']).optional(),
})

// Booking form schema
export const bookingSchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  startDate: dateSchema,
  endDate: dateSchema,
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().optional(),
  specialRequests: z.string().optional(),
}).refine((data) => {
  const start = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
  const end = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)
  return end > start
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// OTP form schema
export const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  email: emailSchema.optional(),
})

// Profile preferences schema
export const profilePreferencesSchema = z.object({
  locale: z.enum(['en', 'en-US', 'th', 'th-TH']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currency: z.enum(['USD', 'THB']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  interests: z.array(z.string()).optional(),
})

// Search form schema
export const searchSchema = z.object({
  query: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  year: z.string().optional(),
  condition: z.string().optional(),
  region: z.string().optional(),
})

// Export all schemas
export const schemas = {
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  price: priceSchema,
  date: dateSchema,
  login: loginSchema,
  register: registerSchema,
  contact: contactSchema,
  booking: bookingSchema,
  otp: otpSchema,
  profilePreferences: profilePreferencesSchema,
  search: searchSchema,
}

export default schemas

