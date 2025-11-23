import { useForm } from 'react-hook-form'
import { X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCreateCar, useUpdateCar } from '../../hooks/useCars'
import { CarType, Transmission, FuelType } from '../../types/api'

/**
 * CarFormModal - Modal for creating/editing cars
 * Uses new DTO types and optimistic updates
 */
const CarFormModal = ({ car, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: car || {
      available: true,
      featured: false,
    }
  })

  const createMutation = useCreateCar()
  const updateMutation = useUpdateCar()

  const mutation = car ? updateMutation : createMutation
  const isLoading = mutation.isPending

  const onSubmit = async (data) => {
    try {
      const carData = {
        ...data,
        pricePerDay: parseFloat(data.pricePerDay),
        seats: parseInt(data.seats),
        year: parseInt(data.year),
        available: data.available === 'true' || data.available === true,
        featured: data.featured === 'true' || data.featured === true,
      }

      if (car) {
        await mutation.mutateAsync({ id: car.id, carData })
        toast.success('Car updated successfully')
      } else {
        await mutation.mutateAsync(carData)
        toast.success('Car added successfully')
      }
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {car ? 'Edit Car' : 'Add New Car'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Name *
              </label>
              <input
                type="text"
                className="input-field"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                className="input-field"
                {...register('brand', { required: 'Brand is required' })}
              />
              {errors.brand && (
                <p className="text-red-600 text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                className="input-field"
                {...register('type', { required: 'Type is required' })}
              >
                <option value="">Select type</option>
                {Object.values(CarType).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                className="input-field"
                {...register('year', { required: 'Year is required' })}
              />
              {errors.year && (
                <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Day ($) *
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                {...register('pricePerDay', { required: 'Price is required' })}
              />
              {errors.pricePerDay && (
                <p className="text-red-600 text-sm mt-1">{errors.pricePerDay.message}</p>
              )}
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seats *
              </label>
              <input
                type="number"
                className="input-field"
                {...register('seats', { required: 'Seats is required' })}
              />
              {errors.seats && (
                <p className="text-red-600 text-sm mt-1">{errors.seats.message}</p>
              )}
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission *
              </label>
              <select
                className="input-field"
                {...register('transmission', { required: 'Transmission is required' })}
              >
                <option value="">Select transmission</option>
                {Object.values(Transmission).map((transmission) => (
                  <option key={transmission} value={transmission}>
                    {transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
                  </option>
                ))}
              </select>
              {errors.transmission && (
                <p className="text-red-600 text-sm mt-1">{errors.transmission.message}</p>
              )}
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type *
              </label>
              <select
                className="input-field"
                {...register('fuelType', { required: 'Fuel type is required' })}
              >
                <option value="">Select fuel type</option>
                {Object.values(FuelType).map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {fuelType.charAt(0) + fuelType.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.fuelType && (
                <p className="text-red-600 text-sm mt-1">{errors.fuelType.message}</p>
              )}
            </div>

            {/* Available */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability *
              </label>
              <select
                className="input-field"
                {...register('available', { required: 'Availability is required' })}
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            {/* Featured */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured
              </label>
              <select
                className="input-field"
                {...register('featured')}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://example.com/car-image.jpg"
                {...register('imageUrl')}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field"
                rows="4"
                {...register('description')}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{car ? 'Update Car' : 'Add Car'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CarFormModal

