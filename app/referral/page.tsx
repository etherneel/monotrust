"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useActiveAccount } from "thirdweb/react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, Copy, Check, Users, TrendingUp, AlertCircle, Loader2, Search } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  address: string
  invitedBy: string
  joinDate: string
  packagesPurchased: number[]
}

interface TeamStats {
  totalMembers: number
  totalInvested: number
  averageInvestment: number
}

export default function ReferralPage() {
  const account = useActiveAccount()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    totalInvested: 0,
    averageInvestment: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "investment">("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    if (!account?.address) return

    const fetchTeamData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `https://monoapi.triblocktechnology.com/getdirectteamdata?userAddress=${account.address}`
        )

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`)
        }

        const data: TeamMember[] = await response.json()
        setTeamMembers(data)

        // Calculate stats
        const totalInvested = data.reduce(
          (sum, member) => sum + member.packagesPurchased.reduce((a, b) => a + b, 0),
          0
        )
        const avgInvestment = data.length > 0 ? totalInvested / data.length : 0

        setStats({
          totalMembers: data.length,
          totalInvested,
          averageInvestment: Math.round(avgInvestment * 100) / 100,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch team data"
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [account?.address])

  // Filter and sort team members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = teamMembers.filter((member) =>
      member.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortBy === "investment") {
      filtered.sort((a, b) => {
        const sumA = a.packagesPurchased.reduce((sum, pkg) => sum + pkg, 0)
        const sumB = b.packagesPurchased.reduce((sum, pkg) => sum + pkg, 0)
        return sumB - sumA
      })
    } else {
      filtered.sort(
        (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      )
    }

    return filtered
  }, [teamMembers, searchTerm, sortBy])

  // Paginate
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage)
  const paginatedMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  if (!account?.address) {
    return (
      <Layout activeView="referral">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-8 max-w-md w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a]">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-center text-foreground mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-sm text-center text-muted-foreground">
              Please connect your wallet to view your referral team.
            </p>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout activeView="referral">
      <div className="mx-auto max-w-7xl px-3 sm:px-3 lg:px-4 py-3">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-xl font-bold text-foreground mb-2">Referral Team</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track your direct team members
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.totalMembers}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                <Users className="w-5 h-5 text-green-600 dark:text-[#15C9BE]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Direct Business</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${stats.totalInvested.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-[#15C9BE] dark:text-[#15C9BE]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Avg. Business</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${stats.averageInvestment.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                <ArrowUpRight className="w-5 h-5 text-[#15C9BE] dark:text-[#15C9BE]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 text-sm h-10 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSortBy("recent")
                setCurrentPage(1)
              }}
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              className="text-xs sm:text-sm h-10"
            >
              Recent
            </Button>
            <Button
              onClick={() => {
                setSortBy("investment")
                setCurrentPage(1)
              }}
              variant={sortBy === "investment" ? "default" : "outline"}
              size="sm"
              className="text-xs sm:text-sm h-10"
            >
              Investment
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading team data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-red-900 dark:text-red-300 mb-1">
                  Error Loading Data
                </h3>
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Team Members Table */}
        {!loading && !error && filteredAndSortedMembers.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-[#1a1a1a]">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#0f0f0f]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-foreground text-xs">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground text-xs">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground text-xs">
                      Packages
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground text-xs">
                      Total Investment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#1a1a1a]">
                  {paginatedMembers.map((member) => {
                    const totalInvestment = member.packagesPurchased.reduce(
                      (sum, pkg) => sum + pkg,
                      0
                    )
                    return (
                      <tr
                        key={member.address}
                        className="hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-foreground">
                              {member.address.slice(0, 6)}...{member.address.slice(-4)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(member.address)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy address"
                            >
                              {copiedAddress === member.address ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {new Date(member.joinDate).toLocaleDateString(undefined, {
                            year: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {member.packagesPurchased.map((pkg, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              >
                                ${pkg}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground text-xs">
                          ${totalInvestment}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden space-y-3">
              {paginatedMembers.map((member) => {
                const totalInvestment = member.packagesPurchased.reduce(
                  (sum, pkg) => sum + pkg,
                  0
                )
                return (
                  <Card
                    key={member.address}
                    className="p-4 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Address</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-foreground truncate">
                              {member.address.slice(0, 6)}...{member.address.slice(-4)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(member.address)}
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              {copiedAddress === member.address ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Investment</p>
                          <p className="font-bold text-sm text-foreground">${totalInvestment}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-[#1a1a1a] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Joined</span>
                          <span className="text-foreground font-medium">
                            {new Date(member.joinDate).toLocaleDateString(undefined, {
                              year: "2-digit",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-2">Packages</p>
                          <div className="flex gap-1 flex-wrap">
                            {member.packagesPurchased.map((pkg, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              >
                                ${pkg}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)} of{" "}
                  {filteredAndSortedMembers.length} members
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        totalPages <= 5
                          ? i + 1
                          : currentPage <= 3
                            ? i + 1
                            : currentPage >= totalPages - 2
                              ? totalPages - 4 + i
                              : currentPage - 2 + i
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-9 h-9 text-xs p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : !loading && !error ? (
          <Card className="p-12 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">No Team Members</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "No members match your search."
                : "You haven't invited any team members yet."}
            </p>
          </Card>
        ) : null}
      </div>
    </Layout>
  )
}
