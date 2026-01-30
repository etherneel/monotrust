"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  BarChart3,
  Search,
  Bell,
  ChevronDown,
  MoreHorizontal,
  X,
  Moon,
  Sun,
  Home,
  Package,
  Users,
  Wallet,
  Gift,
  Settings,
  LayoutDashboard,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { WalletButton } from "./wallet-button"
import { useTheme } from "next-themes"
import { useActiveAccount } from "thirdweb/react"

interface LayoutProps {
  children: React.ReactNode
  activeView: string
}

export default function Layout({ children, activeView }: LayoutProps) {
  const account = useActiveAccount()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [airdropBalance, setAirdropBalance] = useState<number>(0)
const [airdropLoading, setAirdropLoading] = useState(true)


  const [userRank, setUserRank] = useState<string | null>(null)
  const [weeklySalary, setWeeklySalary] = useState<number>(0)
  const [rankLoading, setRankLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!account?.address) {
      setRankLoading(false)
      return
    }

    const fetchRank = async () => {
      try {
        setRankLoading(true)
        const res = await fetch(
          `https://monoapi.triblocktechnology.com/getrank?userAddress=${account.address.toLowerCase()}`
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        setUserRank(data.rank)
        setWeeklySalary(data.weeklySalary || 0)
      } catch {
        setUserRank(null)
        setWeeklySalary(0)
      } finally {
        setRankLoading(false)
      }
    }

    fetchRank()
  }, [account?.address])

  useEffect(() => {
  if (!account?.address) {
    setAirdropLoading(false)
    return
  }

  const fetchAirdrop = async () => {
    try {
      setAirdropLoading(true)
      const res = await fetch(
        `https://monoapi.triblocktechnology.com/airdrop-balance?userAddress=${account.address.toLowerCase()}`
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAirdropBalance(data.airdropBalance || 0)
    } catch {
      setAirdropBalance(0)
    } finally {
      setAirdropLoading(false)
    }
  }

  fetchAirdrop()
}, [account?.address])


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobile) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile])

  useEffect(() => {
    router.prefetch("/")
    router.prefetch("/projects")
    router.prefetch("/wallet")
    router.prefetch("/referrals")
    router.prefetch("/rewards")
    router.prefetch("/settings")
  }, [router])

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  }

  const itemVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -20, opacity: 0 },
  }

  const brandColor = "#15C9BE"
  const brandColorDark = "#0FB5AC"

  const navItems = [
    { name: "Dashboard", icon: BarChart3, path: "/dashboard", view: "dashboard" },
    { name: "My Packages", icon: Package, path: "/packages", view: "packages" },
    { name: "Referrals", icon: Users, path: "/referral", view: "referral" },
    { name: "Binary", icon: Wallet, path: "/mybinary", view: "mybinary" },
    { name: "Claim history", icon: Gift, path: "/claimhistory", view: "claimhistory" },
    { name: "Salary & Rank", icon: Settings, path: "/ranks", view: "ranks" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-hanken flex">
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-[#15C9BE]/5 via-transparent to-[#15C9BE]/5 rounded-r-lg blur-xl opacity-50"></div>
          <div className="relative h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#1a1a1a] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#0f0f0f] to-gray-50 dark:to-[#080808] opacity-50"></div>

            <div className="relative p-[19px] border-b border-gray-200 dark:border-[#1a1a1a]">
            
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="KRYPTOX Logo"
                width={140}
                height={50}
                className="ml-[-40px] object-contain"
              />
            </div>

            </div>

            <div className="relative flex-1 overflow-y-auto py-6">
              <nav className="px-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    className={`flex items-center w-full px-4 py-3 text-left text-md font-medium rounded-md group transition-colors ${
                      activeView === item.view
                        ? `bg-gradient-to-r from-[${brandColor}]/20 to-transparent text-foreground`
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
                    }`}
                    onClick={() => router.push(item.path)}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 transition-colors ${
                        activeView === item.view 
                          ? `text-[${brandColor}]` 
                          : "text-gray-400 dark:text-gray-500 group-hover:text-[#15C9BE]"
                      }`}
                    />
                    <span>{item.name}</span>
                    {activeView === item.view && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                    )}
                  </button>
                ))}
              </nav>

              <motion.div
                className="mx-4 mt-8 p-4 bg-gradient-to-br from-gray-100 dark:from-[#1a1a1a] to-gray-50 dark:to-[#0f0f0f] rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
              >
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Your Rank</div>

                {rankLoading ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : userRank && userRank !== "None" ? (
                  <>
                    <div className="text-base font-bold text-foreground mb-1">{userRank}</div>
                    <div className="text-sm font-bold text-primary">
                      Weekly Salary: ${weeklySalary}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-medium text-gray-400">No rank yet</div>
                )}
              </motion.div>

              <motion.div className="mx-4 mt-3 p-3 rounded-lg border border-[#15C9BE]/30 bg-[#15C9BE]/5">
  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
    Airdrop Balance
  </div>

  {airdropLoading ? (
    <div className="text-sm text-gray-400">Loading...</div>
  ) : (
    <div className="text-sm font-bold text-[#15C9BE]">
      {airdropBalance} Tokens
    </div>
  )}
</motion.div>

            </div>

            <div className="relative p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-medium"
                  style={{ background: `linear-gradient(to bottom right, ${brandColor}, ${brandColorDark})` }}
                >
                  K
                </div>
              </div>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-700" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <motion.div
          ref={sidebarRef}
          variants={sidebarVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
        >
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-[#15C9BE]/5 via-transparent to-[#15C9BE]/5 rounded-r-lg blur-xl opacity-50"></div>
            <div className="relative h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#1a1a1a] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#0f0f0f] to-gray-50 dark:to-[#080808] opacity-50"></div>

             <div className="relative p-6 border-b border-gray-200 dark:border-[#1a1a1a]">
  <div className="flex items-center justify-between">
    <div className="flex items-center justify-center flex-1">
      <img
        src="/logo.png"
        alt="KRYPTOX Logo"
        width={140}
        height={50}
        className="ml-[-40px] object-contain"
      />
    </div>
    <button className="text-gray-400 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
      <X className="w-6 h-6" />
    </button>
  </div>
</div>

              <div className="relative flex-1 overflow-y-auto py-6">
                <nav className="px-4 space-y-2">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.name}
                      variants={itemVariants}
                      className={`flex items-center w-full px-4 py-3 text-left text-md font-medium rounded-md group transition-colors ${
                        activeView === item.view
                          ? `bg-gradient-to-r from-[${brandColor}]/20 to-transparent text-foreground`
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
                      }`}
                      onClick={() => {
                        router.push(item.path)
                        setSidebarOpen(false)
                      }}
                    >
                      <item.icon
                        className={`w-5 h-5 mr-3 transition-colors ${
                          activeView === item.view 
                            ? `text-[${brandColor}]` 
                            : "text-gray-400 dark:text-gray-500 group-hover:text-[#15C9BE]"
                        }`}
                      />
                      <span>{item.name}</span>
                      {activeView === item.view && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                      )}
                    </motion.button>
                  ))}
                </nav>

                <motion.div
                  variants={itemVariants}
                  className="mx-4 mt-8 p-4 bg-gradient-to-br from-gray-100 dark:from-[#1a1a1a] to-gray-50 dark:to-[#0f0f0f] rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Your Rank</div>

                  {rankLoading ? (
                    <div className="text-sm text-gray-400">Loading...</div>
                  ) : userRank && userRank !== "None" ? (
                    <>
                      <div className="text-base font-bold text-foreground mb-1">{userRank}</div>
                      <div className="text-sm font-bold text-primary">
                        Weekly Salary: ${weeklySalary}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-medium text-gray-400">No rank yet</div>
                  )}
                </motion.div>

                <motion.div
  variants={itemVariants}
  className="mx-4 mt-3 p-3 rounded-lg border border-[#15C9BE]/30 bg-[#15C9BE]/5"
>
  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
    Airdrop Balance
  </div>

  {airdropLoading ? (
    <div className="text-sm text-gray-400">Loading...</div>
  ) : (
    <div className="text-sm font-bold text-[#15C9BE]">
      {airdropBalance} Tokens
    </div>
  )}
</motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#1a1a1a] py-3 px-6 transition-shadow ${
            isScrolled ? "shadow-lg shadow-black/5 dark:shadow-black/30" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden relative w-8 h-8 flex flex-col justify-center items-center group"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 ${sidebarOpen ? "rotate-45 translate-y-1" : "-translate-y-1"}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 ${sidebarOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 ${sidebarOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"}`}></span>
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
                </button>
              )}
              <div className="flex-shrink-0">
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}