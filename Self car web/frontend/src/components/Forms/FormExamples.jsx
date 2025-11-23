/**
 * Form Examples & Documentation (FE-080)
 * 
 * Comprehensive examples of using form primitives with Zod + RHF
 * Demonstrates:
 * - Inline validation patterns
 * - Descriptive help text
 * - Masked inputs (phone, price)
 * - Error handling
 * - Form submission
 */

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../Foundation'
import FormField from './FormField'
import { contactSchema, bookingSchema } from '../../utils/validation'

/**
 * Example 1: Contact/Lead Form with Phone Mask
 */
export const ContactFormExample = () => {
  const methods = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      preferredContactMethod: 'email',
    },
    mode: 'onChange', // Real-time validation
  })

  const onSubmit = async (data) => {
    console.log('Form submitted:', data)
    // Handle form submission
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          required
          helperText="Enter your full name as you'd like to be addressed"
          validationMode="onChange"
        />

        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          helperText="We'll use this to send you updates"
          validationMode="onChange"
        />

        <FormField
          name="phone"
          label="Phone Number"
          type="tel"
          mask="phone"
          placeholder="(555) 123-4567"
          helperText="Optional - for faster communication"
          validationMode="onBlur"
        />

        <FormField
          name="preferredContactMethod"
          label="Preferred Contact Method"
          as="select"
          options={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'both', label: 'Both' },
          ]}
          helperText="How would you like us to contact you?"
        />

        <FormField
          name="message"
          label="Message"
          type="textarea"
          placeholder="Tell us about your interest..."
          required
          helperText="Minimum 10 characters. Include any questions or special requests."
          validationMode="onChange"
          rows={5}
        />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Submit
        </Button>
      </form>
    </FormProvider>
  )
}

/**
 * Example 2: Booking Form with Price Mask
 */
export const BookingFormExample = () => {
  const methods = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      carId: '',
      startDate: '',
      endDate: '',
      pickupLocation: '',
      dropoffLocation: '',
      specialRequests: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    console.log('Booking submitted:', data)
    // Handle booking submission
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="carId"
          label="Car ID"
          type="text"
          required
          helperText="Select a car from the list"
        />

        <FormField
          name="startDate"
          label="Start Date"
          type="date"
          required
          helperText="When do you want to start your rental?"
          validationMode="onBlur"
        />

        <FormField
          name="endDate"
          label="End Date"
          type="date"
          required
          helperText="When do you want to return the car?"
          validationMode="onBlur"
        />

        <FormField
          name="pickupLocation"
          label="Pickup Location"
          type="text"
          required
          helperText="Where would you like to pick up the car?"
        />

        <FormField
          name="dropoffLocation"
          label="Dropoff Location (Optional)"
          type="text"
          helperText="Leave empty if same as pickup location"
        />

        <FormField
          name="specialRequests"
          label="Special Requests"
          type="textarea"
          helperText="Any special requirements or requests?"
          rows={3}
        />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Book Now
        </Button>
      </form>
    </FormProvider>
  )
}

/**
 * Example 3: Custom Validation Schema
 */
const customFormSchema = z.object({
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => {
      const num = parseFloat(val.replace(/[^\d.]/g, ''))
      return !isNaN(num) && num > 0
    }, 'Please enter a valid price'),
  
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const digits = val.replace(/\D/g, '')
      return digits.length === 10
    }, 'Phone number must be 10 digits'),
})

export const CustomValidationExample = () => {
  const methods = useForm({
    resolver: zodResolver(customFormSchema),
    defaultValues: {
      price: '',
      phone: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    console.log('Custom form submitted:', data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="price"
          label="Price"
          type="text"
          mask="price"
          placeholder="0.00"
          required
          helperText="Enter the price in USD"
          validationMode="onChange"
        />

        <FormField
          name="phone"
          label="Phone Number"
          type="tel"
          mask="phone"
          placeholder="(555) 123-4567"
          helperText="Optional - 10 digit phone number"
          validationMode="onBlur"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Submit
        </Button>
      </form>
    </FormProvider>
  )
}

export default {
  ContactFormExample,
  BookingFormExample,
  CustomValidationExample,
}

