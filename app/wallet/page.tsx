"use client"

import { useState } from "react"
import { ExternalLink, Info, Wallet, MapPin, BarChart3, Shield, Zap, Activity, MoreVertical, Clock } from "lucide-react"
import Layout from "@/components/layout"
import { motion } from "framer-motion"

// Sample staking data
const stakingAssets = [
  {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    rewardRate: 13.62,
    change: 6.95,
    isPositive: true,
    currentPrice: 2966,
    pricePrefix: "+$",
    chartColor: "#f97316",
    bgGradient: "from-orange-500/10 to-orange-600/5",
  },
  {
    id: 2,
    name: "BNB Chain",
    symbol: "BNB",
    icon: "🟡",
    rewardRate: 12.72,
    change: 5.67,
    isPositive: true,
    currentPrice: 2009,
    pricePrefix: "+$",
    chartColor: "#ea580c",
    bgGradient: "from-orange-500/10 to-orange-600/5",
  },
  {
    id: 3,
    name: "Polygon",
    symbol: "Matic",
    icon: "🟣",
    rewardRate: 6.29,
    change: -1.89,
    isPositive: false,
    currentPrice: 0.987,
    pricePrefix: "-$",
    chartColor: "#fb923c",
    bgGradient: "from-orange-500/10 to-orange-600/5",
  },
]

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("staking")
  const [investmentPeriod, setInvestmentPeriod] = useState(6)

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Enhanced chart component with more realistic data
  const PriceChart = ({ asset }) => {
    // Generate more realistic chart data
    const generateChartPath = () => {
      const points = 50
      const height = 60
      const width = 200

      let path = `M 0 ${height / 2}`
      let prevY = height / 2

      for (let i = 1; i <= points; i++) {
        const x = (i / points) * width
        // Create more realistic price movement
        const trend = asset.isPositive ? -0.3 : 0.3
        const volatility = 8
        const change = (Math.random() - 0.5) * volatility + trend
        let y = prevY + change

        // Keep within bounds
        y = Math.max(10, Math.min(height - 10, y))

        path += ` L ${x} ${y}`
        prevY = y
      }

      return path
    }

    const chartPath = generateChartPath()

    return (
      <div className="relative h-16 w-full">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          {/* Grid lines */}
          {[20, 40].map((y) => (
            <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="2,2" />
          ))}

          {/* Price line */}
          <path d={chartPath} fill="none" stroke={asset.chartColor} strokeWidth="1.5" className="drop-shadow-sm" />

          {/* Gradient fill */}
          <defs>
            <linearGradient id={`gradient-${asset.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={asset.chartColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={asset.chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${chartPath} L 200 60 L 0 60 Z`} fill={`url(#gradient-${asset.id})`} />

          {/* End point */}
          <circle cx="200" cy={chartPath.split(" ").pop()} r="2" fill={asset.chartColor} className="drop-shadow-sm" />
        </svg>

        {/* Price labels */}
        <div className="absolute right-0 top-0 text-right">
          <div className="text-[10px] text-gray-500">
            {asset.pricePrefix}
            {asset.currentPrice.toLocaleString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout activeView="wallet">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Top Staking Assets</h1>
          <div className="flex items-center space-x-3 text-[11px]">
            <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>24H</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">Proof of Stake</button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">Desc</button>
          </div>
        </div>

        {/* Tabs - More subtle */}
        <div className="inline-flex bg-gray-100 dark:bg-[#0a0a0a] p-0.5 rounded-lg">
          <button
            onClick={() => setActiveTab("staking")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              activeTab === "staking" ? "bg-gray-200 dark:bg-[#1a1a1a] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Stakes
          </button>
          <button
            onClick={() => setActiveTab("rewards")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              activeTab === "rewards"
                ? "bg-gray-200 dark:bg-[#1a1a1a] text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Rewards
          </button>
        </div>

        {/* Staking Assets Cards - Enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {stakingAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur border border-gray-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-green-300 dark:hover:border-[#2a2a2a] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#151515] flex items-center justify-center text-sm">
              {asset.icon}
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Proof of Stake</div>
              <div className="text-xs font-medium text-foreground">
                      {asset.name} ({asset.symbol})
                    </div>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mb-3">
              <div className="text-[10px] text-muted-foreground mb-0.5">Reward Rate</div>
              <div className="mb-2">
                <span className="text-xl font-semibold text-foreground">{asset.rewardRate}%</span>
              </div>
              </div>

              <PriceChart asset={asset} />
            </motion.div>
          ))}
        </div>

        {/* Active Stakings Section - More refined */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#0a0a0a]/80 backdrop-blur border border-[#1a1a1a] rounded-xl p-5"
        >
          <h3 className="text-sm font-medium text-gray-300 mb-4">Your active stakings</h3>

          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] text-gray-500">Last Update • 46 minutes ago</span>
                <Info className="w-3 h-3 text-gray-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-100 mb-0.5">Stake Avalanche (AVAX)</h2>
              <div className="text-[10px] text-gray-500">Current Reward Balance: AVAX</div>
            </div>
            <button className="flex items-center space-x-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
              <ExternalLink className="w-3 h-3" />
              <span>View Profile</span>
            </button>
          </div>

          <div className="text-3xl font-semibold text-gray-100 mb-5 font-mono">31.39686</div>

          <div className="flex space-x-2 mb-6">
            <button className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-xs transition-all">
              Upgrade
            </button>
            <button className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 font-medium rounded-lg text-xs transition-all">
              Unstake
            </button>
          </div>

          {/* Stats Grid - More sophisticated */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Momentum</span>
                <Activity className="w-3 h-3 text-gray-600" />
              </div>
              <div className="text-[9px] text-gray-600 mb-1">Growth dynamics</div>
              <div className="text-base font-semibold text-red-400">-0.82%</div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">General</span>
                <BarChart3 className="w-3 h-3 text-gray-600" />
              </div>
              <div className="text-[9px] text-gray-600 mb-1">Overview</div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-gray-500">Staked Tokens Trend</span>
                  <span className="text-[8px] bg-[#1a1a1a] px-1 py-0.5 rounded text-gray-500">24H</span>
                </div>
                <div className="text-base font-semibold">
                  $41.99 <span className="text-[10px] text-red-400 font-normal">-1.09%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Risk</span>
                <Shield className="w-3 h-3 text-gray-600" />
              </div>
              <div className="text-[9px] text-gray-600 mb-1">Risk assessment</div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-gray-500">Staking Ratio</span>
                  <span className="text-[8px] bg-[#1a1a1a] px-1 py-0.5 rounded text-gray-500">24H</span>
                </div>
                <div className="text-base font-semibold">60.6%</div>
              </div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Reward</span>
                <Zap className="w-3 h-3 text-gray-600" />
              </div>
              <div className="text-[9px] text-gray-600 mb-1">Expected profit</div>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"></div>
                  </div>
                  <span className="text-[9px] text-gray-500 whitespace-nowrap">
                    2.23% <span className="text-gray-600">6m Ago</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"></div>
                  </div>
                  <span className="text-[9px] text-gray-500 whitespace-nowrap">
                    1.46% <span className="text-gray-600">3m Ago</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar - More polished */}
        <div className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-20">
            <div className="bg-[#0a0a0a]/80 backdrop-blur border border-[#1a1a1a] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center">
                    <span className="text-sm">💎</span>
                  </div>
                  <h3 className="text-sm font-medium">Liquid Staking Portfolio</h3>
                </div>
                <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-md font-medium">
                  New
                </span>
              </div>

              <p className="text-[10px] text-gray-500 mb-5 leading-relaxed">
                An all-in-one portfolio that helps you make smarter investments into Ethereum Liquid Staking.
              </p>

              <div className="space-y-2 mb-5">
                <button className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center space-x-2 transition-all group">
                  <Wallet className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Connect with Wallet</span>
                </button>
                <button className="w-full py-2.5 bg-[#151515] hover:bg-[#1a1a1a] text-gray-400 rounded-lg flex items-center justify-center space-x-2 transition-all group">
                  <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Enter a Wallet Address</span>
                </button>
              </div>

              {/* Investment Period - More refined */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-300">Investment Period</h4>
                  <span className="text-[10px] bg-[#151515] px-2 py-0.5 rounded-md text-gray-400">
                    {investmentPeriod} Month
                  </span>
                </div>
                <div className="text-[9px] text-gray-500 mb-2">Contribution Period (Months)</div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={investmentPeriod}
                    onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-1">
                    <span className="text-[9px] text-gray-600">1M</span>
                    <span className="text-[9px] text-gray-600">6M</span>
                    <span className="text-[9px] text-gray-600">12M</span>
                  </div>
                </div>
              </div>

              {/* Reward Rate - More sophisticated */}
              <div className="mt-8">
                <h4 className="text-xs font-medium text-gray-300 mb-3">Reward Rate</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden mr-2">
                        <div className="h-full w-[70%] bg-gradient-to-r from-orange-500/50 to-orange-400/30 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">2.23%</span>
                      <span className="text-[9px] text-gray-600 ml-1">6m Ago</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden mr-2">
                        <div className="h-full w-[45%] bg-gradient-to-r from-orange-500/50 to-orange-400/30 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">1.46%</span>
                      <span className="text-[9px] text-gray-600 ml-1">3m Ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
