import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingAPI } from '../../services/api'
import { format } from 'date-fns'
import { Loader, Check, X, Calendar, CheckCircle2, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../../components/Admin/DataTable'
import { Spinner } from '../../components/Shared/LoadingSkeleton'
import { ErrorState } from '../../components/Shared/ErrorState'
import { BookingStatus } from '../../types/api'

const AdminBookings = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'admin', { page, pageSize, sortBy, sortDir }],
    queryFn: async () => {
      const params = {
        page,
        size: pageSize,
      }
      if (sortBy) {
        params.sort = sortBy
        params.sortDir = sortDir || 'asc'
      }
      const response = await bookingAPI.getAllBookings(params)
      // Handle both paginated and non-paginated responses
      if (response.data.content) {
        return {
          content: response.data.content,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          page: response.data.page || page,
          size: response.data.size || pageSize,
        }
      }
      return {
        content: Array.isArray(response.data) ? response.data : [],
        totalElements: Array.isArray(response.data) ? response.data.length : 0,
        totalPages: 1,
        page: 0,
        size: Array.isArray(response.data) ? response.data.length : pageSize,
      }
    },
  })

  const bookings = data?.content || []
  const totalItems = data?.totalElements || 0

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await bookingAPI.updateBookingStatus(id, status)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking status updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status')
    },
  })

  const handleStatusUpdate = async (id, status) => {
    await updateStatus.mutateAsync({ id, status })
  }

  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey)
    setSortDir(direction)
    setPage(0) // Reset to first page on sort
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
      case BookingStatus.COMPLETED:
        return <CheckCircle2 size={16} />
      case BookingStatus.CANCELLED:
        return <X size={16} />
      default:
        return <Calendar size={16} />
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Booking ID',
      sortable: true,
      render: (booking) => (
        <span className="text-sm font-bold text-gray-900">#{booking.id}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: false,
      render: (booking) => (
        <div className="text-sm">
          <div className="font-bold text-gray-900">
            {booking.user?.firstName} {booking.user?.lastName}
          </div>
          <div className="text-gray-500">{booking.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'car',
      label: 'Car',
      sortable: false,
      render: (booking) => (
        <div className="text-sm">
          <div className="font-bold text-gray-900">{booking.car?.name}</div>
          <div className="text-gray-500">{booking.car?.brand}</div>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Dates',
      sortable: true,
      render: (booking) => (
        <div className="text-sm text-gray-900">
          <div className="font-medium">
            {format(new Date(booking.startDate), 'MMM dd, yyyy')}
          </div>
          <div className="text-gray-500 text-xs">
            to {format(new Date(booking.endDate), 'MMM dd, yyyy')}
          </div>
        </div>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Total',
      sortable: true,
      render: (booking) => (
        <span className="text-sm font-bold text-primary-600">
          {formatPrice(booking.totalPrice)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (booking) => (
        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
          {getStatusIcon(booking.status)}
          {booking.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (booking) => (
        <div className="flex space-x-2">
          {booking.status === BookingStatus.PENDING && (
            <>
              <button
                onClick={() => handleStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                disabled={updateStatus.isPending}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Confirm"
              >
                {updateStatus.isPending ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
              </button>
              <button
                onClick={() => handleStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                disabled={updateStatus.isPending}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </>
          )}
          {booking.status === BookingStatus.CONFIRMED && (
            <button
              onClick={() => handleStatusUpdate(booking.id, BookingStatus.COMPLETED)}
              disabled={updateStatus.isPending}
              className="px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
            >
              {updateStatus.isPending ? (
                <Loader className="animate-spin inline" size={14} />
              ) : (
                'Mark Complete'
              )}
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <ErrorState
        title="Failed to load bookings"
        message={error.response?.data?.message || error.message || 'An error occurred while loading bookings.'}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Manage Bookings
          </h1>
          <p className="text-gray-600 text-lg">View and manage all customer bookings</p>
        </div>

        {/* Data Table */}
        <DataTable
          data={bookings}
          columns={columns}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(0)
          }}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDir}
          loading={isLoading}
          emptyMessage="No bookings found. Bookings will appear here once customers start making reservations."
          emptyIcon={Calendar}
        />
      </div>
    </div>
  )
}

export default AdminBookings
