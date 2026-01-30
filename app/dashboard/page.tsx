
///------LATESTTTT

"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Copy,
  TrendingUp,
  Zap,
  Target,
  Crown,
  AlertCircle,
  Loader2,
  Lock,
  DollarSign,
  Users,
  HandIcon,
  Wallet,
  Network,
} from "lucide-react";
import Layout from "@/components/layout";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseEther } from "viem";
import { client, defaultChain } from "@/lib/thirdweb";
import { format } from "date-fns";
import { ProgressPackage } from "@/components/progresspackage";

const noScrollbarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// === CONFIG ===
const BASE_URL = "https://monoapi.triblocktechnology.com";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const PRESALE_CONTRACT = "0x01006E55da7cBfB69E282276b7B9278f70DBc583";

interface InvestmentTier {
  name: string;
  roi: string;
  icon: React.ReactNode;
  packages: number[];
  description: string;
}

const tiers: InvestmentTier[] = [
  {
    name: "Bronze",
    roi: "1% Daily ROI",
    icon: <TrendingUp className="w-6 h-6" />,
    packages: [5, 10, 25],
    description: "Starter investment tier",
  },
  {
    name: "Silver",
    roi: "1.5% Daily ROI",
    icon: <Zap className="w-6 h-6" />,
    packages: [50, 100, 250],
    description: "Enhanced returns tier",
  },
  {
    name: "Gold",
    roi: "2% Daily ROI",
    icon: <Target className="w-6 h-6" />,
    packages: [500, 1000, 2500],
    description: "Premium tier",
  },
  {
    name: "Platinum",
    roi: "3% Daily ROI",
    icon: <TrendingUp className="w-6 h-6" />,
    packages: [5000, 10000, 20000],
    description: "Exclusive tier",
  },
  {
    name: "Elite",
    roi: "5% Daily ROI",
    icon: <Crown className="w-6 h-6" />,
    packages: [50000, 100000],
    description: "Ultimate tier",
  },
];

export default function ProjectsPage() {
  const account = useActiveAccount();

  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<number>(tiers[0].packages[0]);
  const [referrerAddress, setReferrerAddress] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [leg, setLeg] = useState<"left" | "right">("left");
  const [isReferrerLocked, setIsReferrerLocked] = useState(false);
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [purchasedPackages, setPurchasedPackages] = useState<Set<number>>(new Set());
  const [totalTeam, setTotalTeam] = useState<number>(0);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [directTeam, setDirectTeam] = useState<number>(0);
  const [loadingTeamCounts, setLoadingTeamCounts] = useState(true);

  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true);

  // === MOCKED STATS FOR CARDS (replace with real useReadContract later) ===
  const stats = {
    directIncome: 1250,          // Total direct referral income (USDT)
    totalClaimed: 780,           // Already claimed
    totalPending: 470,           // Pending to claim
    directTeam: 18,              // Direct referrals count
    totalTeam: 142,              // Full downline count
  };

  // === THIRDWEB CONTRACTS ===
  const usdtContract = getContract({ client, chain: defaultChain, address: USDT_ADDRESS });
  const mainContract = getContract({ client, chain: defaultChain, address: PRESALE_CONTRACT });

  // === SEND TRANSACTION HOOK ===
  const { mutate: sendTx, isPending: isTxPending, error: txError, isSuccess: isTxSuccess } = useSendTransaction();

  // === ALLOWANCE CHECK ===
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    contract: usdtContract,
    method: "function allowance(address owner, address spender) view returns (uint256)",
    params: account?.address ? [account.address, PRESALE_CONTRACT] : ["0x0", "0x0"],
  });

  // === GET USER DETAILS ===
  const { data: userDetails, isLoading: isLoadingUserDetailsFromChain } = useReadContract({
    contract: mainContract,
    method: "function getUserDetails(address user) view returns (address referrer, uint8 leg, uint256 totalUsdtDeposited, uint256 joinTime)",
    params: account?.address ? [account.address] : ["0x0000000000000000000000000000000000000000"],
  });

  // === GET DIRECT INCOME FROM CONTRACT ===
const { data: directIncomeRaw } = useReadContract({
  contract: mainContract,
  method: "function getDirectIncome(address user) view returns (uint256)",
  params: account?.address ? [account.address] : ["0x0000000000000000000000000000000000000000"],
});

// === GET TOTAL DIRECT CLAIMED FROM CONTRACT ===
const { data: totalDirectClaimedRaw } = useReadContract({
  contract: mainContract,
  method: "function getTotalDirectClaimed(address user) view returns (uint256)",
  params: account?.address ? [account.address] : ["0x0000000000000000000000000000000000000000"],
});

// === GET PENDING INCOME FROM CONTRACT ===
const { data: pendingIncomeRaw } = useReadContract({
  contract: mainContract,
  method: "function getPendingIncome(address user) view returns (uint256)",
  params: account?.address ? [account.address] : ["0x0000000000000000000000000000000000000000"],
});

const { data: totalClaimedRaw } = useReadContract({
  contract: mainContract,
  method: "function totalClaimed(address user) view returns (uint256)",
  params: account?.address ? [account.address] : ["0x0000000000000000000000000000000000000000"],
});

const additionalClaimed = totalClaimedRaw
  ? Number(totalClaimedRaw) / 1e18
  : 0;

// Convert raw value (assuming 18 decimals) to readable number
const pendingIncome = pendingIncomeRaw
  ? Number(pendingIncomeRaw) / 1e18
  : 0;

// Convert raw value (assuming 18 decimals) to readable number
const totalDirectClaimed = totalDirectClaimedRaw
  ? Number(totalDirectClaimedRaw) / 1e18
  : 0;

// Convert raw value (assuming 18 decimals) to readable number
const directIncome = directIncomeRaw
  ? Number(directIncomeRaw) / 1e18
  : 0;

// Sum both values for the card display
const totalClaimedSum = totalDirectClaimed + additionalClaimed;

  // === CHECK USER PACKAGES FOR EACH AMOUNT ===
  

  // Auto-fill referrer & lock if exists
  useEffect(() => {
    if (userDetails && account?.address) {
      const [referrer, legFromChain, , joinTime] = userDetails;

      if (referrer && referrer !== "0x0000000000000000000000000000000000000000") {
        setReferrerAddress(referrer);
        setIsReferrerLocked(true);
        setLeg(legFromChain === 0 ? "left" : "right");
      }

      if (joinTime && joinTime > 0n) {
        const date = new Date(Number(joinTime) * 1000);
        setJoinDate(format(date, "MMMM dd, yyyy"));
      }

      setIsLoadingUserDetails(false);
    }
  }, [userDetails, account?.address]);

  useEffect(() => {
  if (!account?.address) return;

  const fetchTotalTeam = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch(
        `${BASE_URL}/gettotalteamcount?userAddress=${account.address.toLowerCase()}`
      );
      if (!res.ok) throw new Error("Failed to fetch team count");
      const data = await res.json();
      setTotalTeam(data.totalTeamCount || 0); // adjust key name based on your API response
    } catch (err) {
      console.error("Failed to load total team:", err);
      setTotalTeam(0);
    } finally {
      setLoadingTeam(false);
    }
  };

  fetchTotalTeam();
}, [account?.address]);

  // Auto-set approved if allowance is sufficient
  useEffect(() => {
    if (allowance !== undefined) {
      const approvedAmount = Number(allowance) / 1e18;
      if (approvedAmount >= 1000) setIsApproved(true);
    }
  }, [allowance]);

  // Handle approval tx states
  useEffect(() => {
    if (isTxSuccess) {
      toast.success("Transaction Completed successfully!");
      setIsApproved(true);
      refetchAllowance();
      setIsApproving(false);
    }
  }, [isTxSuccess]);

  useEffect(() => {
  if (!account?.address) return;

  const fetchTeamCounts = async () => {
    try {
      setLoadingTeamCounts(true);
      const res = await fetch(
        `${BASE_URL}/gettotalteamcount?userAddress=${account.address.toLowerCase()}`
      );
      if (!res.ok) throw new Error("Failed to fetch team counts");
      const data = await res.json();

      setDirectTeam(data.directTeamCount || 0);
      setTotalTeam(data.totalTeamCount || 0);
    } catch (err) {
      console.error("Team fetch error:", err);
      setDirectTeam(0);
      setTotalTeam(0);
    } finally {
      setLoadingTeamCounts(false);
    }
  };

  fetchTeamCounts();
}, [account?.address]);

  useEffect(() => {
    if (txError) {
      toast.error("Approval failed");
      setIsApproving(false);
    }
  }, [txError]);

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleApproveUSDT = async () => {
    if (!account) return toast.error("Connect wallet");

    try {
      setIsApproving(true);

      const transaction = prepareContractCall({
        contract: usdtContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [PRESALE_CONTRACT, BigInt(1000) * BigInt(1e18)],
      });

      sendTx(transaction);
    } catch (err) {
      console.error("Approval preparation failed:", err);
      toast.error("Failed to prepare approval");
      setIsApproving(false);
    }
  };

  const handleClaimPendingIncome = async () => {
  if (!account?.address) {
    toast.error("Please connect your wallet first");
    return;
  }
  if (pendingIncome <= 0) {
    toast.info("No pending income to claim");
    return;
  }

  try {
    const transaction = prepareContractCall({
      contract: mainContract,
      method: "function claimIncome() external",
      params: [],
    });

    sendTx(transaction, {
      onSuccess: async () => {
        toast.success("Pending income claimed successfully!");

        // Call backend API after successful on-chain claim
        try {
         const response = await fetch(`${BASE_URL}/claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userAddress: account.address,
              claimedAmount: pendingIncome, // or actual claimed value if available
              type: "ROI",
            }),
          });

          if (!response.ok) throw new Error("Backend claim failed");
          // Optional: refetch stats if needed
        } catch (apiErr) {
          console.error("Backend claim error:", apiErr);
          toast.error("Failed to record claim (ROI)");
        }
      },
      onError: (err) => {
        console.error("Claim failed:", err);
        toast.error("Claim transaction failed");
      },
    });
  } catch (err) {
    console.error("Claim preparation failed:", err);
    toast.error("Failed to prepare claim transaction");
  }
};

  const handlePurchasePackage = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!referrerAddress) {
      toast.error("Please enter a referrer address");
      return;
    }

    if (!isApproved) {
      toast.error("Please approve USDT first");
      return;
    }

    setIsPurchasing(true);

    try {
      const legValue = leg === "left" ? 0 : 1;

      const transaction = prepareContractCall({
        contract: mainContract,
        method: "function purchase(uint256 packageAmount, address referrer, uint8 leg) external",
        params: [
          BigInt(selectedPackage) * BigInt(1e18),
          referrerAddress,
          legValue,
        ],
      });

      sendTx(transaction, {
        onSuccess: async () => {
          try {
            const backendResponse = await fetch(`${BASE_URL}/purchase`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userAddress: account.address.toLowerCase(),
                referrerAddress,
                packageAmount: selectedPackage,
                packageRoi: tiers[selectedTier].roi,
                tierName: tiers[selectedTier].name,
                leg,
              }),
            });

            if (!backendResponse.ok) {
              const errData = await backendResponse.json();
              throw new Error(errData.error || "Backend failed to record purchase");
            }

            toast.success(
              `Successfully purchased $${selectedPackage} package in ${leg} leg!`
            );
            setReferrerAddress("");
          } catch (backendErr) {
            console.error("Backend record failed:", backendErr);
            toast.error("On-chain success but failed to save to database");
          } finally {
            setIsPurchasing(false);
          }
        },
        onError: () => {
          toast.error("On-chain purchase failed");
          setIsPurchasing(false);
        },
      });
    } catch (err) {
      console.error("Purchase preparation failed:", err);
      toast.error("Failed to prepare purchase");
      setIsPurchasing(false);
    }
  };

  // === CLAIM DIRECT INCOME HANDLER (mocked for now) ===
  const handleClaimDirectIncome = async () => {
  if (!account?.address) {
    toast.error("Please connect your wallet first");
    return;
  }

  try {
    const transaction = prepareContractCall({
      contract: mainContract,
      method: "function claimDirect() external",
      params: [],
    });

    sendTx(transaction, {
      onSuccess: async () => {
        toast.success("Direct claim successful!");

        try {
         const response = await fetch(`${BASE_URL}/claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userAddress: account.address,
              claimedAmount: directIncome, 
              type: "Referral",
            }),
          });

          if (!response.ok) throw new Error("Backend claim failed");
        } catch (apiErr) {
          console.error("Backend claim error:", apiErr);
          toast.error("Failed to record Referral claim");
        }
      },
      onError: (err) => {
        console.error("Claim failed:", err);
        toast.error("Claim transaction failed");
      },
    });
  } catch (err) {
    console.error("Claim preparation failed:", err);
    toast.error("Failed to prepare claim transaction");
  }
};

  return (
    <>
      <style>{noScrollbarStyles}</style>
      <Layout activeView="projects">
        <div className="mx-auto max-w-7xl pt-4">
          {/* === NEW DASHBOARD CARDS (5 in 1 row) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
  {/* Card 1: Direct Income */}
  <div className="
    bg-white border border-gray-100 rounded-xl p-5
    dark:bg-[#141414] dark:border-none
  ">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100/30 dark:bg-[#15C9BE]/5 flex items-center justify-center">
          <HandIcon className="w-3 h-3 text-[#15C9BE]" />
        </div>
        <h3 className="text-sm font-medium text-foreground">Direct Income</h3>
      </div>
      <Button
        size="sm"
        className="h-8 px-3 text-xs bg-[#15C9BE] hover:bg-[#0FB5AC] text-white"
        onClick={handleClaimDirectIncome}
      >
        Claim
      </Button>
    </div>
    <p className="text-xl font-bold text-black dark:text-gray-300">
      ${directIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
  </div>

  {/* Card 2: Total Claimed */}
  <div className="
    bg-white border border-gray-100 rounded-xl p-5
    dark:bg-[#141414] dark:border-none
  ">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-lg bg-lime-100/30 dark:bg-[#15C9BE]/5 flex items-center justify-center">
      <Wallet className="w-3 h-3 text-[#15C9BE]" />
    </div>
    <h3 className="text-sm font-medium text-foreground">Total Claimed</h3>
  </div>
  <p className="text-xl font-bold text-black dark:text-gray-300">
    ${totalClaimedSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
  </p>
</div>

  {/* Card 3: Total Pending */}
{/* Card 3: Total Pending - Real data + Claim button */}
 <div className="
    bg-white border border-gray-100 rounded-xl p-5
    dark:bg-[#141414] dark:border-none
  ">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-yellow-100/30 dark:bg-[#15C9BE]/5 flex items-center justify-center">
        <AlertCircle className="w-3 h-3 text-[#15C9BE]" />
      </div>
      <h3 className="text-sm font-medium text-foreground">Total Pending</h3>
    </div>
    <Button
      size="sm"
      className="h-8 px-3 text-xs bg-[#15C9BE] hover:bg-[#0FB5AC] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClaimPendingIncome}
      disabled={pendingIncome <= 0 || isPurchasing} // disable if nothing to claim or during other tx
    >
      Claim
    </Button>
  </div>
  <p className="text-xl font-bold text-black dark:text-gray-300">
    ${pendingIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </p>
</div>

  {/* Card 4: Direct Team */}
  {/* Card 4: Direct Team */}
<div className="
  bg-white border border-gray-100 rounded-xl p-5
  dark:bg-[#141414] dark:border-none
">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-lg bg-teal-100/30 dark:bg-[#15C9BE]/5 flex items-center justify-center">
      <Users className="w-3 h-3 text-[#15C9BE]" />
    </div>
    <h3 className="text-sm font-medium text-foreground">Direct Team</h3>
  </div>
  <p className="text-xl font-bold text-black dark:text-gray-300">
    {loadingTeamCounts ? "..." : directTeam}
  </p>
</div>

  {/* Card 5: Total Team */}
 {/* Card 5: Total Team */}
<div className="
  bg-white border border-gray-100 rounded-xl p-5
  dark:bg-[#141414] dark:border-none
">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-lg bg-cyan-100/30 dark:bg-[#15C9BE]/5 flex items-center justify-center">
      <Network className="w-3 h-3 text-[#15C9BE]" />
    </div>
    <h3 className="text-sm font-medium text-foreground">Total Team</h3>
  </div>
  <p className="text-xl font-bold text-black dark:text-gray-300">
    {loadingTeam ? "..." : totalTeam}
  </p>
</div>
</div>

          {/* === EXISTING CONTENT BELOW === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Plan Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 space-y-6">
                  {/* Marquee announcement */}
                  <div className="bg-[#15C9BE]/5 dark:bg-[#15C9BE]/10 border border-[#15C9BE]/20 dark:border-[#15C9BE]/30 rounded-lg p-3 overflow-hidden relative">
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15C9BE] opacity-40"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#15C9BE]"></span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div
                          className="inline-flex animate-marquee whitespace-nowrap"
                          style={{
                            animationDuration: "28s",
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                          }}
                        >
                          <span className="text-sm font-medium text-[#15C9BE] dark:text-[#15C9BE]/90 px-4">
                            🎉 Welcome to MonoTrust Network! Start referring your friends and family to grow your network — build a decentralized revenue generation platform together 💎
                          </span>

                          <span className="text-sm font-medium text-[#15C9BE] dark:text-[#15C9BE]/90 px-4">
                            🎉 Welcome to MonoTrust Network! Start referring your friends and family to grow your network — build a decentralized revenue generation platform together 💎
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tiers Grid */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {tiers.map((tier, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedTier(index);
                            setSelectedPackage(tier.packages[0]);
                          }}
                          className={`
                            p-3 rounded-lg cursor-pointer transition-all border
                            ${
                              selectedTier === index
                                ? "border-2 border-dotted border-[#15C9BE]/70 bg-[#15C9BE]/5 text-foreground shadow-sm"
                                : "bg-card border-border/40 text-muted-foreground dark:bg-[#1f1f1f] dark:border-[#272727] dark:text-gray-300"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[#15C9BE]">{tier.icon}</div>
                            {selectedTier === index && (
                              <Check className="w-4 h-4 text-[#15C9BE]" />
                            )}
                          </div>
                          <p className="font-bold text-sm mb-0.5">{tier.name}</p>
                          <p className="text-xs font-semibold text-[#15C9BE]">
                            {tier.roi}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {tier.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Packages Selection */}
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground mb-1">
                        Package Amount
                      </h2>
                      <p className="text-xs text-muted-foreground">Select amount</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {tiers[selectedTier].packages.map((pkg) => {
                        const isPurchased = purchasedPackages.has(pkg);
                        return (
                          <button
                            key={pkg}
                            onClick={() => !isPurchased && setSelectedPackage(pkg)}
                            disabled={isPurchased}
                            title={isPurchased ? "Already Purchased" : ""}
                            className={`
                              p-2.5 rounded-lg font-semibold text-xs transition-all border relative
                              ${
                                selectedPackage === pkg && !isPurchased
                                  ? "bg-[#15C9BE] text-white shadow-md border-[#15C9BE]/50"
                                  : isPurchased
                                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700"
                                  : "bg-white dark:bg-[#191919] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-700/50"
                              }
                            `}
                          >
                            ${pkg.toLocaleString()}
                            {isPurchased && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                Purchased
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leg Selection */}
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground mb-1">
                        Position
                      </h2>
                      <p className="text-xs text-muted-foreground">Choose leg</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["left", "right"] as const).map((legOption) => (
                        <button
                          key={legOption}
                          onClick={() => setLeg(legOption)}
                          className={`
                            p-3 rounded-lg font-bold text-sm transition-all capitalize border
                            ${
                              leg === legOption
                                ? "bg-[#15C9BE]/10 text-[#15C9BE] border-2 border-dotted border-[#15C9BE]/60"
                                : "bg-card border border-border/50 text-foreground hover:bg-card/80"
                            }
                          `}
                        >
                          {legOption === "left" ? "Left Leg" : "Right Leg"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Checkout */}
            <div className="p-5 rounded-lg bg-card border border-border/60">
              <h3 className="text-base font-bold text-foreground mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-5 pb-5 border-b border-border/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-md font-medium text-muted-foreground">Tier</span>
                  <span className="text-md font-semibold">{tiers[selectedTier].name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-md font-medium text-muted-foreground">Daily ROI</span>
                  <span className="text-md font-medium text-[#15C9BE]">
                    {tiers[selectedTier].roi}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-md font-medium text-muted-foreground">Amount</span>
                  <span className="text-md font-medium">
                    ${selectedPackage.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-md font-medium text-muted-foreground">Position</span>
                  <span className="text-md font-medium capitalize">{leg}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-[#15C9BE]">
                  ${selectedPackage.toLocaleString()}
                </span>
              </div>

              {/* Referrer Address + Copy Button */}
              <div className="space-y-3 mb-5">
                <label className="text-xs font-bold text-foreground block flex items-center justify-between">
                  Referrer Address
                  {isReferrerLocked && (
                    <span className="text-xs text-[#15C9BE] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                  {joinDate && (
                    <span className="text-xs text-muted-foreground">
                      Joined: {joinDate}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    placeholder="Enter referrer address"
                    value={referrerAddress}
                    onChange={(e) => !isReferrerLocked && setReferrerAddress(e.target.value)}
                    disabled={isReferrerLocked}
                    className={`text-xs bg-background border-border/60 h-9 focus-visible:ring-[#15C9BE]/50 focus-visible:border-[#15C9BE]/60 ${isReferrerLocked ? "cursor-not-allowed opacity-70" : ""}`}
                  />
                  {isReferrerLocked && (
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#15C9BE]/70" />
                  )}
                </div>
              </div>

              {/* Info box when not connected */}
              {!isApproved && !account?.address && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#15C9BE]/5 border border-[#15C9BE]/20 mb-5 text-xs">
                  <AlertCircle className="w-4 h-4 text-[#15C9BE] flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    Connect your wallet to continue
                  </p>
                </div>
              )}

              {/* Approve USDT Button */}
              <Button
                onClick={handleApproveUSDT}
                disabled={
                  isApproving ||
                  isTxPending ||
                  isApproved ||
                  !account?.address ||
                  !usdtContract
                }
                className="w-full h-9 mb-3 text-md font-bold transition-all"
                style={{
                  backgroundColor: isApproved ? "transparent" : "#15C9BE",
                  color: isApproved ? "#15C9BE" : "white",
                  border: isApproved ? `1px solid #15C9BE` : "none",
                }}
              >
                {isApproving || isTxPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : isApproved ? (
                  "✓ USDT Approved"
                ) : (
                  "Register"
                )}
              </Button>

              {/* Purchase Package Button */}
              <Button
                onClick={handlePurchasePackage}
                disabled={
                  isPurchasing ||
                  !isApproved ||
                  !referrerAddress ||
                  !account?.address ||
                  !mainContract
                }
                className="w-full h-9 text-md font-bold"
                style={{
                  backgroundColor: "#15C9BE",
                  color: "white",
                }}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Purchase Package"
                )}
              </Button>
            </div>
          </div>
        </div>
         <div className="mt-5 mb-12 p-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a]">
                <ProgressPackage />
      </div>
      </Layout>
      
    </>
  );
}