'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout'
import { useActiveAccount } from 'thirdweb/react'
import { Award, Zap } from 'lucide-react'

interface RankData {
  name: string
  direct: number
  team: number
  salary: number
  bgColor: string
  bgDark: string
}

interface UserRank {
  rank: string
  weeklySalary: number
}

const RANKS: RankData[] = [
  { name: 'Ruby', direct: 200, team: 500, salary: 15, bgColor: 'bg-white', bgDark: 'dark:bg-red-950/40' },
  { name: 'Diamond', direct: 400, team: 1000, salary: 30, bgColor: 'bg-white', bgDark: 'dark:bg-blue-950/40' },
  { name: 'Blue Diamond', direct: 600, team: 2000, salary: 60, bgColor: 'bg-white', bgDark: 'dark:bg-cyan-950/40' },
  { name: 'Black Diamond', direct: 2000, team: 10000, salary: 150, bgColor: 'bg-white', bgDark: 'dark:bg-gray-900/60' },
  { name: 'Crown', direct: 5000, team: 25000, salary: 300, bgColor: 'bg-white', bgDark: 'dark:bg-yellow-950/40' },
  { name: 'Topaz', direct: 7000, team: 50000, salary: 600, bgColor: 'bg-white', bgDark: 'dark:bg-amber-950/40' },
  { name: 'Kohinoor', direct: 10000, team: 100000, salary: 1500, bgColor: 'bg-white', bgDark: 'dark:bg-purple-950/40' },
]

export default function RanksPage() {
  const account = useActiveAccount()
  const [userRank, setUserRank] = useState<string | null>(null)
  const [weeklySalary, setWeeklySalary] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!account?.address) return setLoading(false)

      try {
        setLoading(true)
        const res = await fetch(`https://monoapi.triblocktechnology.com/getrank?userAddress=${account.address}`)
        if (!res.ok) throw new Error('Failed')
        const data: UserRank = await res.json()
        setUserRank(data.rank)
        setWeeklySalary(data.weeklySalary)
      } catch {
        setError('Failed to load rank')
        setUserRank(null)
        setWeeklySalary(0)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRank()
  }, [account?.address])

  if (!account?.address) {
    return (
      <Layout activeView="ranks">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Connect wallet</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout activeView="ranks">
      <div className="mx-auto max-w-7xl p-2">
       
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {RANKS.map((rank) => {
  const isUnlocked = userRank === rank.name
  return (
    <div
      key={rank.name}
      className={`relative rounded-xl border transition-all duration-200 text-left p-4 ${
        isUnlocked
          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
          : 'border-border/50 bg-card/50 hover:border-primary/30'
      }`}
    >
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          Unlocked
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-2">{rank.name}</h3>
      <div className="space-y-1 text-xs">
        <p>Direct: <span className="font-medium">${rank.direct.toLocaleString()}</span></p>
        <p>Team: <span className="font-medium">${rank.team.toLocaleString()}</span></p>
        <p className="mt-3 pt-2 border-t border-border/30">
          Salary: <span className="font-bold text-primary">${rank.salary}/wk</span>
        </p>
      </div>

     {isUnlocked && (
  <button
    onClick={async () => {
      if (!account?.address) return;
      try {
        const res = await fetch("https://monoapi.triblocktechnology.com/claim-salary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAddress: account.address }),
        });
        const data = await res.json();
        if (res.ok) {
          alert("Salary claimed! Tx: " + data.txHash);
          // Optional: refresh rank/salary
          setWeeklySalary(0);
        } else {
          alert(data.error || "Claim failed");
        }
      } catch (err) {
        alert("Network error");
      }
    }}
    className="mt-4 w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
    disabled={loading}
  >
    Claim Salary
  </button>
)}
    </div>
  )
})}
        </div>

        {/* Sidebar */}
       
      </div>
    </Layout>
  )
}