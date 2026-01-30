'use client'

import { useState, useEffect, useMemo } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { toast } from "sonner";
import Layout from '@/components/layout'
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Target, ArrowUpRight, ArrowDownLeft, Search, Loader2 } from 'lucide-react'

interface BinaryMatchingRecord {
  _id?: string
  userAddress: string
  matchedUserAddress: string
  purchasedAmount: number
  binaryMatchingReward: number
  leg: 'left' | 'right'
  date: string
}

const ITEMS_PER_PAGE = 15

export default function MyBinary() {
  const account = useActiveAccount()
  const [data, setData] = useState<BinaryMatchingRecord[]>([])
  const [currentBinaryIncome, setCurrentBinaryIncome] = useState(0);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isClaiming, setIsClaiming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof BinaryMatchingRecord; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!account?.address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `https://monoapi.triblocktechnology.com/mymatchinghistory?userAddress=${account.address}`
        )
        if (!response.ok) throw new Error('Failed to fetch data')
        const result = await response.json()
        setData(Array.isArray(result) ? result : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [account?.address])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
  // Filter safely
  const filtered = data.filter((record) => {
    // Skip invalid records
    if (!record || typeof record !== 'object') return false;

    const searchLower = searchTerm.toLowerCase();

    // Safe _id check
    const idStr = record._id ? String(record._id).toLowerCase() : '';
    const idMatch = idStr.includes(searchLower);

    // Safe leg check
    const legStr = record.leg ? String(record.leg).toLowerCase() : '';
    const legMatch = legStr.includes(searchLower);

    return idMatch || legMatch;
  });

  // Sort safely
  return filtered.sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // Handle missing values
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Date handling (if your date is string, convert)
    if (sortConfig.key === 'date') {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
    }

    return 0;
  });
}, [data, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = data.reduce((sum, record) => sum + record.purchasedAmount, 0)
    const totalReward = data.reduce((sum, record) => sum + record.binaryMatchingReward, 0)
    const leftMatches = data.filter((r) => r.leg === 'left').length
    const rightMatches = data.filter((r) => r.leg === 'right').length

    return {
      totalMatches: data.length,
      totalAmount,
      totalReward,
      leftMatches,
      rightMatches,
      averageReward: data.length > 0 ? (totalReward / data.length).toFixed(4) : '0',
    }
  }, [data])

  // Add this function
const handleClaimBinary = async () => {
  if (!account?.address) return toast.error("Wallet not connected");

  setIsClaiming(true);

  try {
    const res = await fetch("https://monoapi.triblocktechnology.com/claim-binary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress: account.address.toLowerCase() }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Claim failed");
    }

    toast.success("Binary income claimed successfully!");
    // Optional: refresh data
    // fetchData();
  } catch (error:any) {
    toast.error(error.message || "Failed to claim binary income");
  } finally {
    setIsClaiming(false);
  }
};

useEffect(() => {
  if (!account?.address) return;

  const fetchBinaryIncome = async () => {
    try {
      const res = await fetch(
        `https://monoapi.triblocktechnology.com/currentbinaryincome?userAddress=${account.address.toLowerCase()}`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCurrentBinaryIncome(data.currentBinaryIncome || 0);
    } catch (err) {
      console.error(err);
      setCurrentBinaryIncome(0);
    }
  };

  fetchBinaryIncome();
}, [account?.address]);

  const handleSort = (key: keyof BinaryMatchingRecord) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

  if (!account?.address) {
    return (
      <Layout activeView="mybinary">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Please connect your wallet to view binary matching history</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout activeView="mybinary">
      <div className="mx-auto max-w-7xl space-y-6 p-2 md:p-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Binary Matching History</h1>
          <p className="text-xs text-muted-foreground">Track your binary matching rewards and transactions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Matches</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.totalMatches}</p>
          </div>

         <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs text-muted-foreground font-medium">Total Reward</span>
    <Zap className="w-4 h-4 text-green-500" />
  </div>
  <div className="flex items-center justify-between">
    <p className="text-lg font-semibold text-foreground">
      ${currentBinaryIncome.toFixed(2)}
    </p>
    <button
      onClick={handleClaimBinary}
      disabled={isClaiming || currentBinaryIncome <= 0}
      className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
    >
      {isClaiming ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Claiming...
        </>
      ) : (
        "Claim"
      )}
    </button>
  </div>
</div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Purchased</span>
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">${stats.totalAmount.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Avg Reward</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">${stats.averageReward}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by transaction ID or leg..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-500 mb-2">Error loading data</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No binary matching records found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#1a1a1a]">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">Sr. No</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('leg')}>
                        Leg {sortConfig.key === 'leg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">Matched Address</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('purchasedAmount')}>
                        Purchased {sortConfig.key === 'purchasedAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('binaryMatchingReward')}>
                        Reward {sortConfig.key === 'binaryMatchingReward' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record, index) => (
                      <tr key={record._id} className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatDate(record.date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {record.leg === 'left' ? (
                              <ArrowDownLeft className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm font-semibold text-foreground capitalize">{record.leg}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">
                          <code className="bg-gray-100 dark:bg-[#0f0f0f] px-2 py-1 rounded text-xs">
                            {record.matchedUserAddress.slice(0, 6)}...{record.matchedUserAddress.slice(-4)}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">${record.purchasedAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-500">${record.binaryMatchingReward.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {paginatedData.map((record, index) => (
                  <div key={record._id} className="bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                      <span className="text-xs text-muted-foreground">Sr. No</span>
                      <span className="text-sm font-semibold text-foreground">{startIndex + index + 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Date</span>
                      <span className="text-sm font-semibold text-foreground">{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Leg</span>
                      <div className="flex items-center gap-2">
                        {record.leg === 'left' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-semibold text-foreground capitalize">{record.leg}</span>
                      </div>
                    </div>
                   <div className="flex items-center justify-between">
  <span className="text-xs text-muted-foreground">Matched Address</span>
  <span className="text-xs bg-white dark:bg-[#0a0a0a] px-2 py-1 rounded text-foreground">
    {record.matchedUserAddress.slice(0, 6)}...{record.matchedUserAddress.slice(-4)}
  </span>
</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Purchased</span>
                      <span className="text-sm font-semibold text-foreground">${record.purchasedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Reward</span>
                      <span className="text-sm font-semibold text-green-500">${record.binaryMatchingReward.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#1a1a1a] px-4 py-3 bg-gray-50 dark:bg-[#0f0f0f]">
                  <div className="text-xs text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedData.length)} of{' '}
                    {filteredAndSortedData.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-foreground" />
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
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-[#1a1a1a] text-foreground hover:bg-gray-300 dark:hover:bg-[#2a2a2a]'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
