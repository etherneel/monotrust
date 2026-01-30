import { Loader2 } from "lucide-react"

export default function ReferralLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading referral data...</p>
      </div>
    </div>
  )
}
