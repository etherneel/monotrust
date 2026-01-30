"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";

interface Purchase {
  _id: string;
  date: string;
  referrerAddress: string;
  packageAmount: number;
  packageRoi: string;
  tierName?: string;
  leg?: string;
}

export default function MyPackagesPage() {
  const account = useActiveAccount();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "https://monoapi.triblocktechnology.com";

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!account?.address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const lowercaseAddress = account.address.toLowerCase();
        const response = await fetch(`${BASE_URL}/purchases/${lowercaseAddress}`);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch purchases (status ${response.status})`);
        }

        const data = await response.json();
        setPurchases(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching purchases:", err);
        setError(err.message || "Could not load your packages");
        toast.error("Failed to load purchase history");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [account?.address]);

  return (
    <Layout activeView="packages">
      <div className="mx-auto max-w-7xl pt-4 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Packages</h1>
          <p className="text-sm text-muted-foreground">
            View your investment history and active packages
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-card/60 rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-card/40 rounded-xl border border-border text-red-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16 bg-card/40 rounded-xl border border-border">
            <h3 className="text-lg font-medium mb-2">No packages yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start investing to see your purchase history here
            </p>
            <button
              onClick={() => (window.location.href = "/projects")}
              className="px-6 py-2.5 bg-[#15C9BE] text-white rounded-lg font-medium hover:bg-[#0FB5AC] transition-colors"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-[#15C9BE]/10 to-transparent px-5 py-4 border-b border-border/60">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-foreground">
                      {purchase.tierName || "Investment Package"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(purchase.date), "MMM dd, yyyy • HH:mm")}
                    </p>
                  </div>
                </div>

                {/* Card Body - 2x2 Grid */}
                <div className="p-5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium text-foreground mt-1">
                      ${purchase.packageAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Daily ROI</p>
                    <p className="font-medium text-[#15C9BE] mt-1">
                      {purchase.packageRoi}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Referrer</p>
                    <p className="font-medium text-foreground mt-1 break-all">
                      {purchase.referrerAddress
                        ? `${purchase.referrerAddress.slice(0, 8)}...${purchase.referrerAddress.slice(-6)}`
                        : "None"}
                    </p>
                  </div>

                  {purchase.leg && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-medium capitalize text-foreground mt-1">
                        {purchase.leg}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}