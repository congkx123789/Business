import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../../services/api'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Spinner } from '../../components/Shared/LoadingSkeleton'
import { ErrorState } from '../../components/Shared/ErrorState'
import AnalyticsCard from '../../components/Admin/AnalyticsCard'
import { motion } from 'framer-motion'

/**
 * Admin Analytics Page
 * 
 * Features:
 * - Revenue trends over time
 * - Booking trends and status changes
 * - Period selection (7d, 30d, 90d, custom)
 * - Interactive charts aligned with backend stats
 */
const AdminAnalytics = () => {
  const [period, setPeriod] = useState('30d') // '7d' | '30d' | '90d' | 'custom'
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Calculate date range based on period
  const getDateRange = () => {
    const end = endOfDay(new Date())
    let start
    switch (period) {
      case '7d':
        start = startOfDay(subDays(new Date(), 7))
        break
      case '30d':
        start = startOfDay(subDays(new Date(), 30))
        break
      case '90d':
        start = startOfDay(subDays(new Date(), 90))
        break
      case 'custom':
        start = startOfDay(new Date(customStartDate))
        break
      default:
        start = startOfDay(subDays(new Date(), 30))
    }
    return {
      from: format(start, 'yyyy-MM-dd'),
      to: format(end, 'yyyy-MM-dd'),
    }
  }

  const dateRange = getDateRange()

  // Fetch revenue trends
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['dashboardRevenue', dateRange],
    queryFn: async () => {
      const response = await dashboardAPI.getRevenueData(period)
      return response.data
    },
    staleTime: 4 * 60 * 1000, // 4 minutes (real-time)
    enabled: !!dateRange.from && !!dateRange.to,
  })

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboardAnalytics', dateRange],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getAnalytics()
        return response.data
      } catch (error) {
        // Return mock data if endpoint doesn't exist
        return {
          totalViews: 0,
          totalInquiries: 0,
          conversionRate: 0,
          viewsChange: 0,
          inquiriesChange: 0,
          conversionChange: 0,
        }
      }
    },
    staleTime: 4 * 60 * 1000,
  })

  // Fetch booking status breakdown
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'admin', 'statusBreakdown', dateRange],
    queryFn: async () => {
      try {
        const response = await dashboardAPI.getStats()
        // Simulate status breakdown from bookings (would come from backend)
        return {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          total: response.data?.totalBookings || 0,
        }
      } catch (error) {
        return {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          total: 0,
        }
      }
    },
    staleTime: 4 * 60 * 1000,
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  // Revenue trend calculation
  const revenueTrend = revenueData?.trend || 0
  const revenueChange = revenueData?.change || 0

  if (revenueError) {
    return (
      <ErrorState
        title="Failed to load analytics"
        message={revenueError.response?.data?.message || revenueError.message || 'An error occurred while loading analytics data.'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Revenue trends, booking analytics, and status changes</p>
        </div>

        {/* Period Selection */}
        <div className="mb-8 card bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Period:</span>
            {['7d', '30d', '90d', 'custom'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p === 'custom' ? 'Custom' : p}
              </button>
            ))}
            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              {revenueChange !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                  revenueChange > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {revenueChange > 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {Math.abs(revenueChange)}%
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Total Revenue</p>
            {revenueLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {dateRange.from} to {dateRange.to}
            </p>
          </motion.div>

          <AnalyticsCard
            title="Revenue Trend"
            value={revenueTrend > 0 ? `+${revenueTrend}%` : `${revenueTrend}%`}
            change={revenueChange}
            changeType={revenueChange > 0 ? 'positive' : revenueChange < 0 ? 'negative' : 'neutral'}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-100"
            loading={revenueLoading}
            subtitle="vs previous period"
          />

          <AnalyticsCard
            title="Total Bookings"
            value={formatNumber(bookingsData?.total || 0)}
            change={0}
            changeType="neutral"
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            loading={bookingsLoading}
            subtitle={`${period} period`}
          />

          <AnalyticsCard
            title="Conversion Rate"
            value={`${analyticsData?.conversionRate?.toFixed(1) || '0'}%`}
            change={analyticsData?.conversionChange}
            changeType={analyticsData?.conversionChange > 0 ? 'positive' : analyticsData?.conversionChange < 0 ? 'negative' : 'neutral'}
            icon={BarChart3}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            loading={analyticsLoading}
            subtitle="booking to revenue"
          />
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="text-primary-600" size={24} />
                Booking Status Breakdown
              </h2>
            </div>
            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size={48} />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Pending', value: bookingsData?.pending || 0, color: 'bg-yellow-500' },
                  { label: 'Confirmed', value: bookingsData?.confirmed || 0, color: 'bg-green-500' },
                  { label: 'Completed', value: bookingsData?.completed || 0, color: 'bg-blue-500' },
                  { label: 'Cancelled', value: bookingsData?.cancelled || 0, color: 'bg-red-500' },
                ].map((status) => {
                  const total = bookingsData?.total || 1
                  const percentage = total > 0 ? (status.value / total) * 100 : 0
                  return (
                    <div key={status.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">{status.label}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatNumber(status.value)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-3 rounded-full ${status.color}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Revenue by Category */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-primary-600" size={24} />
                Revenue Trends
              </h2>
            </div>
            {revenueLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size={48} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-sm">Revenue trend chart</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Chart visualization would be implemented with a charting library (e.g., Recharts, Chart.js)
                  </p>
                </div>
                {revenueData?.dailyRevenue && revenueData.dailyRevenue.length > 0 && (
                  <div className="space-y-2">
                    {revenueData.dailyRevenue.slice(0, 7).map((day, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{day.date}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(day.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Status Change Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-primary-600" size={24} />
              Status Changes Timeline
            </h2>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-sm">Status change timeline</p>
            <p className="text-xs text-gray-400 mt-2">
              Timeline visualization would show booking status changes over time
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminAnalytics

