import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../../services/api'
import { Car, Users, DollarSign, Calendar, TrendingUp, Eye, MessageCircle, TrendingDown, ArrowUpRight, Award, Star, Clock, CheckCircle } from 'lucide-react'
import { Spinner } from '../../components/Shared/LoadingSkeleton'
import { ErrorState } from '../../components/Shared/ErrorState'
import AnalyticsCard from '../../components/Admin/AnalyticsCard'
import { motion } from 'framer-motion'

const AdminDashboard = () => {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats()
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getAnalytics()
        return response.data
      } catch (error) {
        // If analytics endpoint doesn't exist, return mock data
        return {
          totalViews: stats?.totalViews || 0,
          totalInquiries: stats?.totalInquiries || 0,
          conversionRate: stats?.conversionRate || 0,
          viewsChange: stats?.viewsChange || 0,
          inquiriesChange: stats?.inquiriesChange || 0,
          conversionChange: stats?.conversionChange || 0,
        }
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!stats, // Only fetch after stats are loaded
  })

  // Seller Score Analytics
  const { data: sellerScore, isLoading: sellerScoreLoading } = useQuery({
    queryKey: ['sellerScore'],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getSellerScore()
        return response.data
      } catch (error) {
        // Return null if endpoint doesn't exist (seller may not have shop)
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - seller score changes less frequently
  })

  // Business Insights
  const { data: businessInsights, isLoading: businessInsightsLoading } = useQuery({
    queryKey: ['businessInsights'],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getBusinessInsights()
        return response.data
      } catch (error) {
        return null
      }
    },
    staleTime: 2 * 60 * 1000,
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const statCards = [
    {
      title: 'Total Cars',
      value: stats?.totalCars || 0,
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    }
  ]

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
        title="Failed to load dashboard"
        message={error.response?.data?.message || error.message || 'An error occurred while loading dashboard data.'}
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your car rental business</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card ${stat.bgLight} border-2 border-transparent hover:border-primary-200 transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-semibold mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className="text-primary-600" size={32} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Views"
            value={analytics?.totalViews?.toLocaleString() || '0'}
            change={analytics?.viewsChange}
            changeType={analytics?.viewsChange > 0 ? 'positive' : analytics?.viewsChange < 0 ? 'negative' : 'neutral'}
            icon={Eye}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            loading={analyticsLoading}
          />
          <AnalyticsCard
            title="Inquiries"
            value={analytics?.totalInquiries?.toLocaleString() || '0'}
            change={analytics?.inquiriesChange}
            changeType={analytics?.inquiriesChange > 0 ? 'positive' : analytics?.inquiriesChange < 0 ? 'negative' : 'neutral'}
            icon={MessageCircle}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            loading={analyticsLoading}
          />
          <AnalyticsCard
            title="Conversion Rate"
            value={`${analytics?.conversionRate?.toFixed(1) || '0'}%`}
            change={analytics?.conversionChange}
            changeType={analytics?.conversionChange > 0 ? 'positive' : analytics?.conversionChange < 0 ? 'negative' : 'neutral'}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-100"
            loading={analyticsLoading}
          />
        </div>

        {/* Seller Analytics Section */}
        {sellerScore && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="text-primary-600" size={28} />
              Seller Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Seller Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <Award className="text-yellow-600" size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    sellerScore.badgeLevel === 'DIAMOND' ? 'bg-purple-100 text-purple-700' :
                    sellerScore.badgeLevel === 'PLATINUM' ? 'bg-gray-100 text-gray-700' :
                    sellerScore.badgeLevel === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                    sellerScore.badgeLevel === 'SILVER' ? 'bg-gray-200 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {sellerScore.badgeLevel}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Seller Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {typeof sellerScore.totalScore === 'string' 
                      ? parseFloat(sellerScore.totalScore).toFixed(1)
                      : sellerScore.totalScore?.toFixed(1) || '0.0'}
                  </p>
                  {sellerScore.isVerifiedDealer && (
                    <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Verified Dealer
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Response Time */}
              <AnalyticsCard
                title="Avg Response Time"
                value={`${typeof sellerScore.avgResponseTimeHours === 'string' 
                  ? parseFloat(sellerScore.avgResponseTimeHours).toFixed(1)
                  : sellerScore.avgResponseTimeHours?.toFixed(1) || '0'}h`}
                icon={Clock}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                loading={sellerScoreLoading}
                subtitle={`Score: ${typeof sellerScore.responseTimeScore === 'string' 
                  ? parseFloat(sellerScore.responseTimeScore).toFixed(1)
                  : sellerScore.responseTimeScore?.toFixed(1) || '0'}/10`}
              />

              {/* Completion Rate */}
              <AnalyticsCard
                title="Completion Rate"
                value={`${typeof sellerScore.completionRate === 'string' 
                  ? parseFloat(sellerScore.completionRate).toFixed(1)
                  : sellerScore.completionRate?.toFixed(1) || '0'}%`}
                icon={CheckCircle}
                iconColor="text-green-600"
                iconBg="bg-green-100"
                loading={sellerScoreLoading}
                subtitle={`${sellerScore.completedOrders || 0}/${sellerScore.totalOrders || 0} orders`}
              />

              {/* Average Rating */}
              <AnalyticsCard
                title="Average Rating"
                value={`${typeof sellerScore.avgRating === 'string' 
                  ? parseFloat(sellerScore.avgRating).toFixed(1)
                  : sellerScore.avgRating?.toFixed(1) || '0'}/5`}
                icon={Star}
                iconColor="text-yellow-600"
                iconBg="bg-yellow-100"
                loading={sellerScoreLoading}
                subtitle={`${sellerScore.totalReviews || 0} reviews`}
              />
            </div>

            {/* Business Insights */}
            {businessInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <DollarSign className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(typeof businessInsights.totalRevenue === 'string' 
                      ? parseFloat(businessInsights.totalRevenue)
                      : businessInsights.totalRevenue || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {businessInsights.totalOrders || 0} orders
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(typeof businessInsights.avgOrderValue === 'string' 
                      ? parseFloat(businessInsights.avgOrderValue)
                      : businessInsights.avgOrderValue || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Conversion: {typeof businessInsights.conversionRate === 'string' 
                      ? parseFloat(businessInsights.conversionRate).toFixed(1)
                      : businessInsights.conversionRate?.toFixed(1) || '0'}%
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Car className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Top Performers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businessInsights.topPerformingCars?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Top cars by revenue
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-primary-600" size={24} />
                Recent Bookings
              </h2>
              <TrendingUp className="text-primary-600" size={20} />
            </div>
            <div className="space-y-3">
              {stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{booking.carName || 'Car Name'}</p>
                      <p className="text-sm text-gray-600">{booking.userName || 'Customer Name'}</p>
                    </div>
                    <span className="text-primary-600 font-bold text-lg">
                      {formatCurrency(booking.totalPrice || 0)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Popular Cars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Car className="text-primary-600" size={24} />
                Popular Cars
              </h2>
              <TrendingUp className="text-primary-600" size={20} />
            </div>
            <div className="space-y-3">
              {stats?.popularCars?.length > 0 ? (
                stats.popularCars.map((car, index) => (
                  <motion.div
                    key={car.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{car.name || 'Car Name'}</p>
                      <p className="text-sm text-gray-600">
                        {car.bookingsCount || 0} bookings
                      </p>
                    </div>
                    <span className="text-primary-600 font-bold text-lg">
                      {formatCurrency(car.pricePerDay || 0)}/day
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Car className="mx-auto mb-4 text-gray-300" size={48} />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
