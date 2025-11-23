import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BarChart3, Database, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'

/**
 * Cache Observability Dashboard (Internal-Only)
 * 
 * Shows cache hit rate and DB-read reduction for product teams.
 * This is a dev-only dashboard to see cache impact.
 * 
 * Access: /admin/cache-dashboard (admin only)
 */
const CacheDashboard = () => {
  const queryClient = useQueryClient()
  const [cacheStats, setCacheStats] = useState({
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalCached: 0,
    cacheSize: 0,
  })
  const [queryCache, setQueryCache] = useState([])

  useEffect(() => {
    // Update cache stats periodically
    const updateStats = () => {
      const cache = queryClient.getQueryCache()
      const allQueries = cache.getAll()
      
      let hits = 0
      let misses = 0
      let totalCached = 0
      
      allQueries.forEach((query) => {
        if (query.state.data) {
          hits++
          totalCached++
        } else if (query.state.error) {
          misses++
        } else {
          misses++
        }
      })

      const queries = allQueries.map((query) => ({
        key: query.queryKey.join('/'),
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        dataFetchStatus: query.state.fetchStatus,
        staleTime: query.options.staleTime,
        gcTime: query.options.gcTime,
        isStale: query.isStale(),
        isFetching: query.isFetching,
      }))

      setCacheStats({
        totalQueries: allQueries.length,
        cacheHits: hits,
        cacheMisses: misses,
        totalCached,
        cacheSize: allQueries.length,
      })
      
      setQueryCache(queries)
    }

    updateStats()
    const interval = setInterval(updateStats, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [queryClient])

  const hitRate = cacheStats.totalQueries > 0
    ? ((cacheStats.cacheHits / cacheStats.totalQueries) * 100).toFixed(1)
    : 0

  const dbReadReduction = cacheStats.totalQueries > 0
    ? ((cacheStats.cacheHits / cacheStats.totalQueries) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cache Observability Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time cache performance metrics and DB-read reduction
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle size={16} />
            <span>Internal-only dashboard for product teams</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cache Hit Rate */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-blue-600">{hitRate}%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Cache Hit Rate</h3>
            <p className="text-xs text-gray-600">
              {cacheStats.cacheHits} hits / {cacheStats.totalQueries} queries
            </p>
          </div>

          {/* DB Read Reduction */}
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Database className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-green-600">{dbReadReduction}%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">DB Read Reduction</h3>
            <p className="text-xs text-gray-600">
              {cacheStats.cacheHits} queries served from cache
            </p>
          </div>

          {/* Total Cached */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-purple-600">{cacheStats.totalCached}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Cached</h3>
            <p className="text-xs text-gray-600">
              {cacheStats.cacheSize} queries in cache
            </p>
          </div>

          {/* Cache Misses */}
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <RefreshCw className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-orange-600">{cacheStats.cacheMisses}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Cache Misses</h3>
            <p className="text-xs text-gray-600">
              Queries requiring fresh data fetch
            </p>
          </div>
        </div>

        {/* Query Cache Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Query Cache</h2>
            <button
              onClick={() => {
                queryClient.clear()
                setCacheStats({
                  totalQueries: 0,
                  cacheHits: 0,
                  cacheMisses: 0,
                  totalCached: 0,
                  cacheSize: 0,
                })
                setQueryCache([])
              }}
              className="btn-secondary text-sm"
            >
              Clear Cache
            </button>
          </div>

          {queryCache.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No queries cached yet</p>
              <p className="text-sm mt-2">Navigate through the app to see cache activity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stale Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GC Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Is Stale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fetching
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queryCache.map((query, index) => (
                    <tr key={index} className={query.isStale ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {query.key.length > 50 ? `${query.key.substring(0, 50)}...` : query.key}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          query.state === 'success' ? 'bg-green-100 text-green-800' :
                          query.state === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {query.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.staleTime ? `${(query.staleTime / 60000).toFixed(0)}m` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.gcTime ? `${(query.gcTime / 60000).toFixed(0)}m` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          query.isStale ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {query.isStale ? 'Stale' : 'Fresh'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          query.isFetching ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {query.isFetching ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cache Configuration */}
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cache Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Domain TTLs (Aligned with Backend)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Static: 55 min (backend: 60 min)</li>
                <li>• Semi-static: 28 min (backend: 30 min)</li>
                <li>• Dynamic: 14 min (backend: 15 min)</li>
                <li>• Inventory: 9 min (backend: 10 min)</li>
                <li>• Real-time: 4 min (backend: 5 min)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Cache Strategy</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• SWR (Stale-While-Revalidate)</li>
                <li>• Prefetch on hover</li>
                <li>• Prefetch on mount</li>
                <li>• Optimistic updates</li>
                <li>• Background refetch</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CacheDashboard

