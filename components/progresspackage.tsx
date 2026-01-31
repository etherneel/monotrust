'use client'

import { useActiveAccount, useReadContract } from 'thirdweb/react'
import { getContract } from 'thirdweb'
import { client } from '@/lib/thirdweb'
import { bsc } from 'thirdweb/chains'
import { TrendingUp, Zap, Target } from 'lucide-react'

const PACKAGES = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000, 50000, 100000]
const CONTRACT_ADDRESS = '0x01006E55da7cBfB69E282276b7B9278f70DBc583'

const packageIcons: Record<number, JSX.Element> = {
  5: <TrendingUp className="w-3 h-3" />,
  10: <TrendingUp className="w-3 h-3" />,
  25: <TrendingUp className="w-3 h-3" />,
  50: <Zap className="w-3 h-3" />,
  100: <Zap className="w-3 h-3" />,
  250: <Zap className="w-3 h-3" />,
  500: <Target className="w-3 h-3" />,
  1000: <Target className="w-3 h-3" />,
  2500: <Target className="w-3 h-3" />,
  5000: <TrendingUp className="w-3 h-3" />,
  10000: <TrendingUp className="w-3 h-3" />,
  20000: <TrendingUp className="w-3 h-3" />,
  50000: <TrendingUp className="w-3 h-3" />,
  100000: <TrendingUp className="w-3 h-3" />,
}

const mainContract = getContract({
  client,
  chain: bsc,
  address: CONTRACT_ADDRESS,
})

function PackageCard({ pkg }: { pkg: number }) {
  const account = useActiveAccount()

  const enabled = !!account?.address


const { data, isLoading, error } = useReadContract({
contract: mainContract,
method: 'function getPackageRoiStatus(address userAddress, uint256 packageAmount) view returns (uint256 totalRoi, uint256 claimed, uint256 pending)',
params: [account?.address as string, BigInt(pkg) * 10n ** 18n],
queryOptions: { enabled },
})

  if (isLoading) {
    return <div className="p-4 rounded-2xl border animate-pulse">Loading...</div>
  }

  if (error || !data) {
    return <div className="p-4 rounded-2xl border text-red-500 text-sm">Failed to load ${pkg}</div>
  }

  const [totalRoi, claimed, pending] = data as [bigint, bigint, bigint]

  const total = Number(totalRoi) / 1e18
const clm = Number(claimed) / 1e18
const pend = Number(pending) / 1e18

// 🔥 MAX LIMIT = 3x package
const maxLimit = pkg * 3

// Total earned so far
const earned = clm + pend

// Progress based on max cap
const progress = maxLimit > 0 ? (earned / maxLimit) * 100 : 0
const isCompleted = earned >= maxLimit

  return (
   <div className="relative p-4 rounded-2xl bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#1a1a1a] hover:shadow-md transition-all">
    {isCompleted && (
  <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full bg-gray-800 text-white shadow-md">
    Completed 🎉
  </div>
)}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          {packageIcons[pkg]}
        </div>
        <p className="text-sm font-bold">${pkg.toLocaleString()}</p>
      </div>

      <p className="text-xs text-muted-foreground">Total ROI</p>
      <p className="text-base font-black text-primary mb-3">${total.toFixed(2)}</p>

      <div className="w-full h-2 bg-gray-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
       <div
  className={`h-full transition-all duration-500 ${
    isCompleted
      ? 'bg-gradient-to-r from-green-400 to-emerald-400'
      : 'bg-gradient-to-r from-primary to-primary/70'
  }`}
  style={{ width: `${Math.min(progress, 100)}%` }}
/>
      </div>

      <div className="flex justify-between text-xs">
        <span>Claimed: ${clm.toFixed(2)}</span>
        <span>Pending: ${pend.toFixed(2)}</span>
      </div>
    </div>
  )
}

export function ProgressPackage() {
  const account = useActiveAccount()

  if (!account?.address) {
    return <div className="p-8 border rounded-2xl">Connect wallet to view ROI</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {PACKAGES.map(pkg => (
        <PackageCard key={pkg} pkg={pkg} />
      ))}
    </div>
  )
}