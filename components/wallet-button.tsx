"use client"

import { ConnectButton } from "thirdweb/react"
import { client, wallets, defaultChain } from "@/lib/thirdweb"
import { darkTheme, lightTheme } from "thirdweb/react"  // ← import these
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function WalletButton() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Resolve effective theme (handles "system" preference)
  const effectiveTheme = theme === "system" ? systemTheme : theme
  const isDark = effectiveTheme === "dark"

  // Define brand-aware themes
  const customDark = darkTheme({
    colors: {
      // Main button (disconnected state)
      primaryButtonBg: "#0a0a0a",           // very dark
      primaryButtonText: "#ffffff",
      //primaryButtonBorder: "#15C9BE33",     // subtle teal border (20% opacity)

      // Accent / hover / connected state
      accentText: "#15C9BE",                // your brand color
      accentButtonBg: "#15C9BE",            // teal button when active/connected
      accentButtonText: "#000000",

      // Modal & other elements
      modalBg: "#111111",
      borderColor: "#15C9BE33",
      separatorLine: "#1a1a1a",
      secondaryText: "#a0a0a0",
    },
  })

  const customLight = lightTheme({
    colors: {
      // Main button (disconnected state)
      primaryButtonBg: "#ffffff",
      primaryButtonText: "#111111",
     // primaryButtonBorder: "#15C9BE80",     // stronger teal border in light mode

      // Accent / hover / connected state
      accentText: "#0FB5AC",                // slightly darker teal for contrast
      accentButtonBg: "#15C9BE",
      accentButtonText: "#ffffff",

      // Modal & other elements
      modalBg: "#f8f9fa",
      borderColor: "#15C9BE80",
      separatorLine: "#e0e0e0",
      secondaryText: "#666666",
    },
  })

  if (!mounted) {
    return null // or a skeleton/placeholder to avoid flash
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={defaultChain}
      theme={isDark ? customDark : customLight}
      connectButton={{
        label: "Connect Wallet",
        style: {
          fontSize: "14px",
          padding: "8px 14px",
          background: isDark ? "#0a0a0a" : "#ffffff",
          border: `1px solid ${isDark ? "#15C9BE33" : "#15C9BE80"}`,
          borderRadius: "6px",
          color: isDark ? "white" : "#111111",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
      }}
      connectModal={{
        size: "compact",
        title: "Connect your wallet",
        showThirdwebBranding: false,
        welcomeScreen: {
          title: "Connect Your Wallet",
          subtitle: "Welcome to presale",
        },
      }}
      detailsButton={{
        style: {
          fontSize: "12px",
          padding: "8px 16px",
          background: isDark ? "#0a0a0a" : "#ffffff",
          border: `1px solid ${isDark ? "#15C9BE33" : "#15C9BE80"}`,
          borderRadius: "6px",
          color: "#15C9BE",
          cursor: "pointer",
        },
      }}
      switchButton={{
        style: {
          fontSize: "12px",
          padding: "8px 16px",
          background: isDark ? "#0a0a0a" : "#ffffff",
          border: `1px solid ${isDark ? "#15C9BE33" : "#15C9BE80"}`,
          borderRadius: "6px",
          color: "#15C9BE",
          cursor: "pointer",
        },
      }}
    />
  )
}