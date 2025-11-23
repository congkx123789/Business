import { useState } from 'react'
import { useCars, useDeleteCar, useToggleCarAvailability, useBulkToggleAvailability } from '../../hooks/useCars'
import { Plus, Edit, Trash2, Loader, Eye, ToggleLeft, ToggleRight, Power, PowerOff } from 'lucide-react'
import toast from 'react-hot-toast'
import CarFormModal from '../../components/Admin/CarFormModal'
import DataTable from '../../components/Admin/DataTable'
import { Spinner } from '../../components/Shared/LoadingSkeleton'
import { ErrorState } from '../../components/Shared/ErrorState'
import { EmptyState } from '../../components/Shared/EmptyState'
import { Link } from 'react-router-dom'

const AdminCars = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const { data, isLoading, error, refetch } = useCars({
    page,
    pageSize,
    sortBy,
    sortDir,
  })

  const cars = data?.content || []
  const totalItems = data?.totalElements || 0

  const deleteCar = useDeleteCar()
  const toggleAvailability = useToggleCarAvailability()
  const bulkToggleAvailability = useBulkToggleAvailability()

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      try {
        await deleteCar.mutateAsync(id)
        toast.success('Car deleted successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete car')
      }
    }
  }

  const handleToggleAvailability = async (id) => {
    try {
      await toggleAvailability.mutateAsync(id)
      toast.success('Car availability updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability')
    }
  }

  const handleBulkAction = async (action, ids) => {
    try {
      if (action.key === 'enable') {
        await bulkToggleAvailability.mutateAsync({ ids, available: true })
        toast.success(`${ids.length} car(s) enabled successfully`)
      } else if (action.key === 'disable') {
        await bulkToggleAvailability.mutateAsync({ ids, available: false })
        toast.success(`${ids.length} car(s) disabled successfully`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action')
    }
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingCar(null)
    setIsModalOpen(true)
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
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const columns = [
    {
      key: 'car',
      label: 'Car',
      sortable: false,
      render: (car) => (
        <div className="flex items-center">
          <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            {car.imageUrl ? (
              <img 
                className="h-16 w-16 object-cover" 
                src={car.imageUrl} 
                alt={car.name} 
              />
            ) : (
              <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">{car.name}</div>
            <div className="text-sm text-gray-500">{car.brand} • {car.year}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (car) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {car.type}
        </span>
      ),
    },
    {
      key: 'pricePerDay',
      label: 'Price/Day',
      sortable: true,
      render: (car) => (
        <span className="text-sm font-bold text-primary-600">
          {formatPrice(car.pricePerDay)}
        </span>
      ),
    },
    {
      key: 'available',
      label: 'Status',
      sortable: true,
      render: (car) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          car.available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {car.available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (car) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleAvailability(car.id)}
            disabled={toggleAvailability.isPending}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              car.available
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={car.available ? 'Make Unavailable' : 'Make Available'}
          >
            {toggleAvailability.isPending ? (
              <Loader className="animate-spin" size={18} />
            ) : car.available ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
          </button>
          <Link
            to={`/cars/${car.id}`}
            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => handleEdit(car)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(car.id)}
            disabled={deleteCar.isPending}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deleteCar.isPending ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      ),
    },
  ]

  const bulkActions = [
    {
      key: 'enable',
      label: 'Enable Selected',
      variant: 'default',
      icon: Power,
    },
    {
      key: 'disable',
      label: 'Disable Selected',
      variant: 'danger',
      icon: PowerOff,
    },
  ]

  if (error) {
    return (
      <ErrorState
        title="Failed to load cars"
        message={error.response?.data?.message || error.message || 'An error occurred while loading cars.'}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Manage Cars
            </h1>
            <p className="text-gray-600 text-lg">Add, edit, or remove cars from your fleet</p>
          </div>
          <button 
            onClick={handleAddNew} 
            className="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            <span>Add New Car</span>
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          data={cars}
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
          selectable={true}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          emptyMessage="No cars found. Add your first car to get started."
          emptyIcon={Plus}
        />

        {/* Modal */}
        {isModalOpen && (
          <CarFormModal
            car={editingCar}
            onClose={() => {
              setIsModalOpen(false)
              setEditingCar(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default AdminCars
