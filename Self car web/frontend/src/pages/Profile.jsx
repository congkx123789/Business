import { useUserBookings } from '../hooks/useBookings'
import useAuthStore from '../store/authStore'
import { Calendar, MapPin, DollarSign, User as UserIcon, Mail, Phone, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { Spinner } from '../components/Shared/LoadingSkeleton'
import { ErrorState } from '../components/Shared/ErrorState'
import { EmptyBookings } from '../components/Shared/EmptyState'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookingStatus } from '../types/api'

const Profile = () => {
  const { user } = useAuthStore()
  const { data: bookings, isLoading, error, refetch } = useUserBookings()

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numPrice)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200'
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200'
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size={64} />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load profile"
        message={error.response?.data?.message || error.message || 'An error occurred while loading your profile.'}
        onRetry={refetch}
      />
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-10 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card bg-gradient-to-br from-white to-primary-50 border-2 border-primary-100">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4"
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${
                    isAdmin
                      ? 'bg-primary-100 text-primary-700 border-primary-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {isAdmin && <Shield size={14} />}
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 border-t border-primary-200 pt-6">
                <div className="flex items-center space-x-3 text-gray-700 p-3 bg-white rounded-lg">
                  <Mail className="text-primary-600" size={20} />
                  <span className="font-medium">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center space-x-3 text-gray-700 p-3 bg-white rounded-lg">
                    <Phone className="text-primary-600" size={20} />
                    <span className="font-medium">{user?.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-700 p-3 bg-white rounded-lg">
                  <UserIcon className="text-primary-600" size={20} />
                  <span className="font-medium">
                    Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Bookings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-r from-primary-50 to-white border-2 border-primary-100"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Shield className="text-primary-600" size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/messages"
                  className="btn-secondary text-center py-3 hover:bg-primary-50 hover:border-primary-300 transition-all"
                >
                  Open Messages
                </Link>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="btn-secondary text-center py-3 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/admin/cars"
                      className="btn-secondary text-center py-3 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      Manage Cars
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/cars"
                      className="btn-secondary text-center py-3 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      Browse Cars
                    </Link>
                    <Link
                      to="/profile"
                      className="btn-secondary text-center py-3 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      Update Profile
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Bookings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Calendar className="text-primary-600" size={24} />
                My Bookings
              </h2>

              {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.car?.name || 'Car Details'}
                          </h3>
                          <p className="text-gray-600">
                            {booking.car?.brand} • {booking.car?.year}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-700 p-2 bg-white rounded-lg">
                          <Calendar className="text-primary-600" size={16} />
                          <span className="font-medium">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 p-2 bg-white rounded-lg">
                          <DollarSign className="text-primary-600" size={16} />
                          <span className="font-bold">{formatPrice(booking.totalPrice)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 p-2 bg-white rounded-lg">
                          <MapPin className="text-primary-600" size={16} />
                          <span className="font-medium">Pickup: {booking.pickupLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 p-2 bg-white rounded-lg">
                          <MapPin className="text-primary-600" size={16} />
                          <span className="font-medium">Dropoff: {booking.dropoffLocation}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyBookings />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

