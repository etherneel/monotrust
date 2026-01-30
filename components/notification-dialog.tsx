"use client"

import { useEffect } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface NotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error"
  title: string
  message: string
  txHash?: string
}

export function NotificationDialog({ isOpen, onClose, type, title, message, txHash }: NotificationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Dialog Container - Fixed positioning for perfect centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] to-[#080808] opacity-50"></div>

                {/* Status indicator line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    type === "success"
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                ></div>

                <div className="relative p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          type === "success" ? "bg-green-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {type === "success" ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 break-words">{message}</p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-white transition-colors p-1 ml-2 flex-shrink-0"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Transaction Hash */}
                  {txHash && (
                    <div className="mb-4 p-3 bg-[#151515] rounded-md">
                      <div className="text-xs text-gray-400 mb-1">Transaction Hash:</div>
                      <div className="text-xs text-white font-mono break-all">{txHash}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    {txHash && (
                      <button
                        onClick={() => window.open(`https://testnet.bscscan.com/tx/${txHash}`, "_blank")}
                        className="w-full sm:w-auto px-4 py-2 text-xs bg-[#1a1a1a] hover:bg-[#222] text-gray-300 rounded-md transition-colors order-2 sm:order-1"
                      >
                        View on BSCScan
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-md transition-colors order-1 sm:order-2 ${
                        type === "success"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
