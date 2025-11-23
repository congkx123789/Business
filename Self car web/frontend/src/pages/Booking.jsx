import { useParams, useNavigate } from 'react-router-dom'
import { useCar } from '../hooks/useCars'
import { useCreateBooking } from '../hooks/useBookings'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Calendar, MapPin, CreditCard, Loader } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Spinner } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import FormField from '../components/Forms/FormField'
import { bookingSchema } from '../utils/validation'
import { trackUserAction } from '../utils/metrics'

const Booking = () => {
  const { carId } = useParams()
  const navigate = useNavigate()
  const createBooking = useCreateBooking()

  const { data: car, isLoading: carLoading, error: carError, refetch } = useCar(carId)

  const methods = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      carId: carId || '',
      startDate: '',
      endDate: '',
      pickupLocation: '',
      dropoffLocation: '',
      specialRequests: '',
    },
    mode: 'onChange', // Real-time validation
  })

  const { watch, handleSubmit } = methods
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Validate dates and calculate total
  const validateDates = () => {
    if (!startDate || !endDate) return { valid: false, error: 'Please select both start and end dates' }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (start < today) {
      return { valid: false, error: 'Start date cannot be in the past' }
    }
    
    if (end <= start) {
      return { valid: false, error: 'End date must be after start date' }
    }
    
    return { valid: true }
  }

  const calculateTotal = () => {
    const validation = validateDates()
    if (!validation.valid || !car) return 0
    
    if (startDate && endDate && car) {
      const days = differenceInDays(new Date(endDate), new Date(startDate))
      const price = typeof car.pricePerDay === 'string' 
        ? parseFloat(car.pricePerDay) 
        : car.pricePerDay
      return days > 0 ? days * price : 0
    }
    return 0
  }

  const getDateValidationError = () => {
    return validateDates().error
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const onSubmit = async (data) => {
    trackUserAction('booking_submission_started', { carId })
    
    // Validate availability
    if (!car?.available) {
      toast.error('This car is currently unavailable')
      trackUserAction('booking_unavailable', { carId })
      return
    }

    // Validate dates
    const dateValidation = validateDates()
    if (!dateValidation.valid) {
      toast.error(dateValidation.error)
      return
    }

    // Validate total price
    const total = calculateTotal()
    if (total <= 0) {
      toast.error('Please select valid dates to calculate the booking total')
      return
    }

    try {
      const bookingData = {
        carId: parseInt(carId),
        startDate: data.startDate,
        endDate: data.endDate,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        totalPrice: total,
      }

      const booking = await createBooking.mutateAsync(bookingData)
      trackUserAction('booking_success', { carId, bookingId: booking.id, totalPrice: total })
      toast.success('Booking created successfully!')
      
      // Redirect to checkout
      navigate(`/checkout?bookingId=${booking.id}&carId=${carId}&startDate=${data.startDate}&endDate=${data.endDate}&totalPrice=${total}`)
    } catch (error) {
      trackUserAction('booking_error', { carId, error: error.message })
      const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.'
      toast.error(errorMessage)
      
      // Handle specific backend validation errors
      if (error.response?.data?.message?.includes('not available')) {
        // Car became unavailable during booking
        refetch()
      }
    }
  }

  if (carLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size={64} />
      </div>
    )
  }

  if (carError || !car) {
    return (
      <ErrorState
        title="Car not found"
        message={carError?.response?.data?.message || carError?.message || 'The car you\'re looking for doesn\'t exist.'}
        showHomeButton
      />
    )
  }

  const totalPrice = calculateTotal()
  const isLoading = createBooking.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-10 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Complete Your Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="startDate"
                    label="Start Date"
                    type="date"
                    required
                    helperText="Select your rental start date"
                    validationMode="onChange"
                    rules={{ min: format(new Date(), 'yyyy-MM-dd') }}
                  />

                  <FormField
                    name="endDate"
                    label="End Date"
                    type="date"
                    required
                    helperText="Select your rental end date"
                    validationMode="onChange"
                    rules={{ min: startDate || format(new Date(), 'yyyy-MM-dd') }}
                  />
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="pickupLocation"
                    label="Pickup Location"
                    type="text"
                    placeholder="Enter pickup address"
                    required
                    helperText="Where would you like to pick up the car?"
                    validationMode="onChange"
                  />

                  <FormField
                    name="dropoffLocation"
                    label="Dropoff Location"
                    type="text"
                    placeholder="Enter dropoff address (optional)"
                    helperText="Leave empty if same as pickup"
                    validationMode="onBlur"
                  />
                </div>

                {/* Special Requests */}
                <FormField
                  name="specialRequests"
                  label="Special Requests"
                  type="textarea"
                  placeholder="Any special requests or notes..."
                  helperText="Optional - Let us know if you need anything special"
                  validationMode="onBlur"
                  rows={4}
                />

              <button
                type="submit"
                disabled={isLoading || !totalPrice || !car?.available}
                className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </span>
                ) : (
                  `Continue to Checkout - ${formatPrice(totalPrice)}`
                )}
              </button>
            </form>
            </FormProvider>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Booking Summary</h3>
              
              <div className="space-y-6">
                {/* Car Info */}
                <div className="flex items-center space-x-4 pb-4 border-b-2 border-primary-200">
                  <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    {car.imageUrl ? (
                      <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{car.name}</h4>
                    <p className="text-sm text-gray-600">{car.brand}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Price per day:</span>
                    <span className="font-bold">{formatPrice(typeof car.pricePerDay === 'string' ? parseFloat(car.pricePerDay) : car.pricePerDay)}</span>
                  </div>
                  
                  {startDate && endDate && (
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Number of days:</span>
                      <span className="font-bold">
                        {differenceInDays(new Date(endDate), new Date(startDate))}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
