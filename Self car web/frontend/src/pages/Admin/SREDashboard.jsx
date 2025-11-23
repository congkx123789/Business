import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../../services/api'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'
import { Spinner } from '../../components/Shared/LoadingSkeleton'
import { ErrorState } from '../../components/Shared/ErrorState'
import AnalyticsCard from '../../components/Admin/AnalyticsCard'
import { motion } from 'framer-motion'

/**
 * SRE Governance Dashboard
 * 
 * Features:
 * - FE error rates and tracking
 * - UX SLOs (Service Level Objectives)
 * - Burn down views for incidents
 * - Link to postmortem library
 * - Quarterly SLO review tracking
 */
const SREDashboard = () => {
  const [sloPeriod, setSloPeriod] = useState('quarter') // 'week' | 'month' | 'quarter'
  const [viewMode, setViewMode] = useState('overview') // 'overview' | 'errors' | 'slos' | 'incidents'

  // Mock SLO data - in production, this would come from monitoring/observability backend
  const { data: sloData, isLoading: sloLoading } = useQuery({
    queryKey: ['sre', 'slos', sloPeriod],
    queryFn: async () => {
      // Mock data - would be fetched from backend
      return {
        availability: {
          target: 99.9,
          current: 99.95,
          status: 'healthy',
        },
        errorRate: {
          target: 0.1, // 0.1%
          current: 0.05,
          status: 'healthy',
        },
        responseTime: {
          target: 200, // ms p95
          current: 180,
          status: 'healthy',
        },
        pageLoadTime: {
          target: 2.0, // seconds
          current: 1.8,
          status: 'healthy',
        },
      }
    },
    staleTime: 4 * 60 * 1000, // 4 minutes
  })

  // Mock error rate data
  const { data: errorRateData, isLoading: errorLoading } = useQuery({
    queryKey: ['sre', 'errorRates', sloPeriod],
    queryFn: async () => {
      // Mock data - would be fetched from backend
      return {
        totalErrors: 45,
        errorRate: 0.05, // 0.05%
        criticalErrors: 2,
        warnings: 43,
        errorTrend: -15, // -15% vs previous period
        topErrors: [
          { message: 'Network timeout', count: 20, severity: 'warning' },
          { message: 'API 500 error', count: 15, severity: 'error' },
          { message: 'Payment processing failed', count: 10, severity: 'critical' },
        ],
      }
    },
    staleTime: 4 * 60 * 1000,
  })

  // Mock incident data
  const { data: incidentData, isLoading: incidentLoading } = useQuery({
    queryKey: ['sre', 'incidents', sloPeriod],
    queryFn: async () => {
      // Mock data - would be fetched from backend
      return {
        totalIncidents: 3,
        resolvedIncidents: 3,
        openIncidents: 0,
        mttr: 45, // Mean Time To Resolution in minutes
        incidents: [
          {
            id: 'INC-001',
            title: 'Payment processing timeout',
            severity: 'high',
            status: 'resolved',
            createdAt: '2024-01-15T10:00:00Z',
            resolvedAt: '2024-01-15T10:45:00Z',
            postmortemLink: '/postmortems/inc-001',
          },
          {
            id: 'INC-002',
            title: 'API rate limit exceeded',
            severity: 'medium',
            status: 'resolved',
            createdAt: '2024-01-14T14:30:00Z',
            resolvedAt: '2024-01-14T15:00:00Z',
            postmortemLink: '/postmortems/inc-002',
          },
          {
            id: 'INC-003',
            title: 'Frontend error spike',
            severity: 'low',
            status: 'resolved',
            createdAt: '2024-01-13T09:15:00Z',
            resolvedAt: '2024-01-13T09:30:00Z',
            postmortemLink: '/postmortems/inc-003',
          },
        ],
      }
    },
    staleTime: 4 * 60 * 1000,
  })

  const getSLOStatus = (current, target, isHigherBetter = true) => {
    if (isHigherBetter) {
      return current >= target ? 'healthy' : 'at-risk'
    } else {
      return current <= target ? 'healthy' : 'at-risk'
    }
  }

  const getSLOStatusColor = (status) => {
    return status === 'healthy' 
      ? 'text-green-600 bg-green-100' 
      : 'text-yellow-600 bg-yellow-100'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            SRE Governance Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Frontend error rates, UX SLOs, and incident tracking</p>
        </div>

        {/* View Mode Selector */}
        <div className="mb-8 card bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">View:</span>
            {['overview', 'errors', 'slos', 'incidents'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {mode}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Period:</span>
              {['week', 'month', 'quarter'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSloPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    sloPeriod === p
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SLO Metrics Overview */}
        {(viewMode === 'overview' || viewMode === 'slos') && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="text-primary-600" size={24} />
              UX SLOs (Service Level Objectives)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sloData && Object.entries(sloData).map(([key, slo]) => {
                const status = getSLOStatus(slo.current, slo.target, key !== 'errorRate' && key !== 'responseTime')
                const statusColor = getSLOStatusColor(status)
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-primary-100 p-3 rounded-xl">
                        {key === 'availability' && <CheckCircle className="text-primary-600" size={24} />}
                        {key === 'errorRate' && <AlertTriangle className="text-primary-600" size={24} />}
                        {key === 'responseTime' && <Zap className="text-primary-600" size={24} />}
                        {key === 'pageLoadTime' && <Clock className="text-primary-600" size={24} />}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                        {status === 'healthy' ? '✓ Healthy' : '⚠ At Risk'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-semibold mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {key === 'errorRate' 
                        ? `${slo.current}%`
                        : key === 'responseTime' || key === 'pageLoadTime'
                        ? `${slo.current}${key === 'responseTime' ? 'ms' : 's'}`
                        : `${slo.current}%`
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Target: {key === 'errorRate' 
                        ? `${slo.target}%`
                        : key === 'responseTime' || key === 'pageLoadTime'
                        ? `${slo.target}${key === 'responseTime' ? 'ms' : 's'}`
                        : `${slo.target}%`
                      }
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Error Rates */}
        {(viewMode === 'overview' || viewMode === 'errors') && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-primary-600" size={24} />
              Frontend Error Rates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <AnalyticsCard
                title="Total Errors"
                value={errorRateData?.totalErrors?.toLocaleString() || '0'}
                change={errorRateData?.errorTrend}
                changeType={errorRateData?.errorTrend < 0 ? 'positive' : errorRateData?.errorTrend > 0 ? 'negative' : 'neutral'}
                icon={AlertTriangle}
                iconColor="text-red-600"
                iconBg="bg-red-100"
                loading={errorLoading}
                subtitle={`${sloPeriod} period`}
              />
              <AnalyticsCard
                title="Error Rate"
                value={`${errorRateData?.errorRate?.toFixed(2) || '0'}%`}
                change={0}
                changeType="neutral"
                icon={Activity}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
                loading={errorLoading}
                subtitle="vs SLO target"
              />
              <AnalyticsCard
                title="Critical Errors"
                value={errorRateData?.criticalErrors?.toLocaleString() || '0'}
                change={0}
                changeType="neutral"
                icon={Shield}
                iconColor="text-red-600"
                iconBg="bg-red-100"
                loading={errorLoading}
                subtitle="requires immediate attention"
              />
              <AnalyticsCard
                title="MTTR"
                value={`${incidentData?.mttr || 0}m`}
                change={0}
                changeType="neutral"
                icon={Clock}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                loading={incidentLoading}
                subtitle="Mean Time To Resolution"
              />
            </div>

            {/* Top Errors */}
            {errorRateData?.topErrors && errorRateData.topErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Errors</h3>
                <div className="space-y-3">
                  {errorRateData.topErrors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{error.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {error.count} occurrence{error.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                        error.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        error.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {error.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Incidents & Burn Down */}
        {(viewMode === 'overview' || viewMode === 'incidents') && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="text-primary-600" size={24} />
              Incidents & Postmortem Library
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Resolved Incidents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {incidentData?.resolvedIncidents || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  of {incidentData?.totalIncidents || 0} total
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Mean Time To Resolution</p>
                <p className="text-3xl font-bold text-gray-900">
                  {incidentData?.mttr || 0}m
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Average resolution time
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Open Incidents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {incidentData?.openIncidents || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Currently active
                </p>
              </motion.div>
            </div>

            {/* Incident List */}
            {incidentData?.incidents && incidentData.incidents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Incidents</h3>
                <div className="space-y-3">
                  {incidentData.incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">{incident.id}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            incident.status === 'resolved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">{incident.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}
                          {incident.resolvedAt && (
                            <> • Resolved: {format(new Date(incident.resolvedAt), 'MMM dd, yyyy HH:mm')}</>
                          )}
                        </p>
                      </div>
                      {incident.postmortemLink && (
                        <a
                          href={incident.postmortemLink}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
                        >
                          View Postmortem
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Quarterly SLO Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-primary-600" size={24} />
            Quarterly SLO Review
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-2">Last Review</p>
              <p className="text-lg font-bold text-gray-900">
                {format(subDays(new Date(), 45), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-2">Next Review</p>
              <p className="text-lg font-bold text-gray-900">
                {format(subDays(new Date(), -90), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-200">
            <p className="text-sm text-gray-600">
              All SLOs are reviewed quarterly to ensure alignment with business objectives and user experience goals.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SREDashboard

