"use client"

import React from "react"

import { useState } from "react"
import { Check, Copy, TrendingUp, Zap, Target, Crown, AlertCircle } from "lucide-react"
import Layout from "@/components/layout"
import { useActiveAccount } from "thirdweb/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ProgressPackage } from "@/components/progresspackage"

interface InvestmentTier {
  name: string
  roi: string
  icon: React.ReactNode
  packages: number[]
  description: string
}

const tiers: InvestmentTier[] = [
  { 
    name: "Bronze", 
    roi: "1% Daily ROI", 
    icon: <TrendingUp className="w-4 h-4" />,
    packages: [5, 10, 25],
    description: "Starter investment tier"
  },
  { 
    name: "Silver", 
    roi: "1.5% Daily ROI", 
    icon: <Zap className="w-4 h-4" />,
    packages: [50, 100, 250],
    description: "Enhanced returns tier"
  },
  { 
    name: "Gold", 
    roi: "2% Daily ROI", 
    icon: <Target className="w-4 h-4" />,
    packages: [500, 1000, 2500],
    description: "Premium tier"
  },
  { 
    name: "Platinum", 
    roi: "3% Daily ROI", 
    icon: <TrendingUp className="w-4 h-4" />,
    packages: [5000, 10000, 20000],
    description: "Exclusive tier"
  },
  { 
    name: "Elite", 
    roi: "5% Daily ROI", 
    icon: <Crown className="w-4 h-4" />,
    packages: [50000, 100000],
    description: "Ultimate tier"
  },
]

export default function ProjectsPage() {
  const account = useActiveAccount()
  const [selectedTier, setSelectedTier] = useState<number>(0)
  const [selectedPackage, setSelectedPackage] = useState<number>(tiers[0].packages[0])
  const [referrerAddress, setReferrerAddress] = useState("")
  const [leg, setLeg] = useState<"left" | "right">("left")
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const handleApproveUSDT = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first")
      return
    }
    
    setIsApproving(true)
    try {
      // Simulate USDT approval
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsApproved(true)
      toast.success("USDT approved successfully!")
    } catch (error) {
      toast.error("Approval failed. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  const handlePurchasePackage = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!referrerAddress) {
      toast.error("Please enter a referrer address")
      return
    }

    if (!isApproved) {
      toast.error("Please approve USDT first")
      return
    }

    setIsPurchasing(true)
    try {
      // Simulate package purchase
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Successfully purchased $${selectedPackage} package in ${leg} leg!`)
      setReferrerAddress("")
    } catch (error) {
      toast.error("Purchase failed. Please try again.")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <Layout activeView="projects">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Investment Plans</h1>
          <p className="text-sm text-muted-foreground">Select your investment package and start earning daily ROI with competitive returns</p>
        </div>

        {/* Package ROI Progress Section */}
        <div className="mb-12 p-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a]">
          <ProgressPackage />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Selection */}
          <div className="lg:col-span-2 space-y-8 p-6 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] shadow-sm backdrop-blur-sm">
            {/* Tiers Grid */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Select Your Tier</h2>
                <p className="text-xs text-muted-foreground">Choose an investment tier based on your ROI preference</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tiers.map((tier, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedTier(index)
                      setSelectedPackage(tier.packages[0])
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                      selectedTier === index
                        ? "bg-primary/15 dark:bg-primary/10 ring-2 ring-primary border-primary/50 shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-[#1a1a1a] hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-1.5 rounded-md ${selectedTier === index ? "bg-primary/20 dark:bg-primary/15" : "bg-gray-100 dark:bg-[#1a1a1a]"} transition-colors`}>
                        <div className={selectedTier === index ? "text-primary" : "text-muted-foreground"}>
                          {tier.icon}
                        </div>
                      </div>
                      {selectedTier === index && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="font-semibold text-sm text-foreground mb-1">{tier.name}</p>
                    <p className="text-xs font-bold text-primary mb-2">{tier.roi}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages Selection */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Select Package Amount</h2>
                <p className="text-xs text-muted-foreground">Available investment amounts for selected tier</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tiers[selectedTier].packages.map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 border backdrop-blur-sm ${
                      selectedPackage === pkg
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-[#1a1a1a] text-foreground hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
                    }`}
                  >
                    ${pkg.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Leg Selection */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Position Selection</h2>
                <p className="text-xs text-muted-foreground">Choose your leg position in the binary structure</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(["left", "right"] as const).map((legOption) => (
                  <button
                    key={legOption}
                    onClick={() => setLeg(legOption)}
                    className={`p-4 rounded-lg font-semibold text-sm transition-all duration-200 border backdrop-blur-sm capitalize ${
                      leg === legOption
                        ? "bg-primary/15 dark:bg-primary/10 text-primary ring-2 ring-primary border-primary/50 shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-[#1a1a1a] text-foreground hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
                    }`}
                  >
                    {legOption === "left" ? "Left Leg" : "Right Leg"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <div className="p-6 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] shadow-md backdrop-blur-sm">
                <h3 className="text-base font-semibold text-foreground mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">Tier</span>
                    <span className="text-sm font-semibold text-foreground">{tiers[selectedTier].name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">Daily ROI</span>
                    <span className="text-sm font-semibold text-primary">{tiers[selectedTier].roi}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">Amount</span>
                    <span className="text-sm font-semibold text-foreground">${selectedPackage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">Position</span>
                    <span className="text-sm font-semibold text-foreground capitalize">{leg}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${selectedPackage.toLocaleString()}</span>
                </div>

                {/* Referrer Address */}
                <div className="space-y-3 mb-6">
                  <label className="text-xs font-semibold text-foreground block">Referrer Address</label>
                  <Input
                    placeholder="Enter referrer address"
                    value={referrerAddress}
                    onChange={(e) => setReferrerAddress(e.target.value)}
                    className="text-xs bg-background border-border"
                  />
                  {account?.address && (
                    <button
                      onClick={handleCopyAddress}
                      className="w-full py-2 px-3 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:bg-card/80 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedAddress ? "Copied!" : "Copy My Address"}
                    </button>
                  )}
                </div>

                {/* Info Box */}
                {!isApproved && !account?.address && (
                  <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                    <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">Connect your wallet to continue</p>
                  </div>
                )}

                {/* Approve Button */}
                <Button
                  onClick={handleApproveUSDT}
                  disabled={isApproving || isApproved || !account?.address}
                  className="w-full mb-3 text-xs font-semibold h-10"
                  variant={isApproved ? "outline" : "default"}
                >
                  {isApproving ? "Approving..." : isApproved ? "✓ Approved" : "Approve USDT"}
                </Button>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchasePackage}
                  disabled={isPurchasing || !isApproved || !referrerAddress || !account?.address}
                  className="w-full text-xs font-semibold h-10"
                >
                  {isPurchasing ? "Processing..." : "Purchase Package"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
