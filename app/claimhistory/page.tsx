'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import Layout from '@/components/layout'
import { Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'

interface ClaimRecord {
  _id: string
  userAddress: string
  claimedAmount: number
  type: string
  date: string
  __v?: number
  status?: 'success' | 'pending' | 'failed'
  transactionHash?: string
}

interface SortConfig {
  key: keyof ClaimRecord | null
  direction: 'asc' | 'desc'
}

export default function ClaimHistoryPage() {
  const account = useActiveAccount()
  const [data, setData] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    if (!account?.address) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`https://monoapi.triblocktechnology.com/claims?userAddress=${account.address.toLowerCase()}`)
        if (!response.ok) throw new Error('Failed to fetch claim history')
        const result = await response.json()

        const formatted = Array.isArray(result)
          ? result.map(item => ({
              ...item,
              claimedAmount: item.claimedAmount,
              type: item.type,
              status: 'success' as const,
              transactionHash: undefined
            }))
          : []

        setData(formatted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [account?.address])

  const handleSort = (key: keyof ClaimRecord) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
    setCurrentPage(1)
  }

  const filteredData = data.filter(
    (record) =>
      record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
  if (!sortConfig.key) return 0;

  const aValue = a[sortConfig.key];
  const bValue = b[sortConfig.key];

  // Handle undefined values
  if (aValue === undefined && bValue === undefined) return 0;
  if (aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
  if (bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return sortConfig.direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return sortConfig.direction === 'asc'
      ? aValue - bValue
      : bValue - aValue;
  }

  return 0;
});

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    totalClaims: data.length,
    totalClaimed: data.reduce((sum, record) => sum + (record.claimedAmount || 0), 0),
    successfulClaims: data.filter((record) => record.status === 'success').length,
    pendingClaims: data.filter((record) => record.status === 'pending').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <Layout activeView="claimhistory">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground mb-2">Claim History</h1>
          <p className="text-sm text-muted-foreground">Track all your reward claims and payouts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Claims</span>
              <Calendar className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.totalClaims}</p>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Claimed</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">${stats.totalClaimed.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Successful</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.successfulClaims}</p>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Pending</span>
              <Clock className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.pendingClaims}</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl shadow-sm backdrop-blur-sm">
          <input
            type="text"
            placeholder="Search by claim type or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#1a1a1a] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error: {error}</p>
            <p className="text-red-500/70 dark:text-red-400/70 text-xs mt-2">Please make sure you are connected with the correct wallet</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-12 text-center">
            <p className="text-muted-foreground text-sm">No claims found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl shadow-sm backdrop-blur-sm">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#1a1a1a]">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground text-xs">Sr. No</th>
                    <th
                      className="px-6 py-4 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground text-xs">Claim Type</th>
                    <th
                      className="px-6 py-4 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('claimedAmount')}
                    >
                      Amount {sortConfig.key === 'claimedAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground text-xs">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground text-xs">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record, index) => (
                    <tr key={record._id} className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground capitalize">{record.type}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-500">${record.claimedAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-3 py-1 rounded-full font-semibold capitalize ${getStatusColor(record.status || 'success')}`}>
                          {record.status || 'success'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <code className="bg-gray-100 dark:bg-[#0f0f0f] px-2 py-1 rounded text-foreground font-mono">
                          {record.transactionHash ? `${record.transactionHash.slice(0, 8)}...` : 'N/A'}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {paginatedData.map((record, index) => (
                <div key={record._id} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 shadow-sm backdrop-blur-sm space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#1a1a1a]">
                    <span className="text-xs text-muted-foreground">Sr. No</span>
                    <span className="text-sm font-bold text-foreground">{startIndex + index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span className="text-sm font-bold text-foreground">{formatDate(record.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Claim Type</span>
                    <span className="text-sm font-bold text-foreground capitalize">{record.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Amount</span>
                    <span className="text-sm font-bold text-green-500">${record.claimedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${getStatusColor(record.status || 'success')}`}>
                      {record.status || 'success'}
                    </span>
                  </div>
                  {record.transactionHash && (
                    <div className="pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
                      <code className="text-xs bg-gray-100 dark:bg-[#0f0f0f] px-2 py-1 rounded text-foreground font-mono">
                        {record.transactionHash.slice(0, 20)}...
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] text-foreground hover:bg-gray-50 dark:hover:bg-[#0f0f0f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] text-foreground hover:bg-gray-50 dark:hover:bg-[#0f0f0f]'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] text-foreground hover:bg-gray-50 dark:hover:bg-[#0f0f0f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>

                <span className="text-xs text-muted-foreground ml-4">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}