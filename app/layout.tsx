import type React from "react"
import type { Metadata } from "next"
import { Hanken_Grotesk } from "next/font/google"
import "./globals.css"
import { ThirdwebProvider } from "thirdweb/react"
import { Toaster } from "sonner"
import ThemeProvider from "@/components/theme-provider"

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "MonoTrust Network",
    template: "%s | MonoTrust Network",
  },
  description:
    "Invest in high-ROI packages, build your referral network, and earn decentralized rewards on MonoTrust Network.",
  keywords: [
    "crypto investment",
    "decentralized rewards",
    "referral program",
    "daily ROI",
    "blockchain presale",
  ],
  authors: [{ name: "MonoTrust Team" }],
  creator: "MonoTrust Network",
  publisher: "MonoTrust Network",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "MonoTrust Network – Smart Investment & Referral Platform",
    description:
      "Purchase investment packages, refer friends, and earn passive income in a decentralized ecosystem.",
    url: "https://monotrust.network", // ← change to your real domain
    siteName: "MonoTrust Network",
    images: [
      {
        url: "/og-image.png", // ← add real OG image in public/
        width: 1200,
        height: 630,
        alt: "MonoTrust Network Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MonoTrust Network",
    description:
      "Earn daily ROI through investment packages and referral rewards.",
    images: ["/og-image.png"], // same as OG
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={hankenGrotesk.variable}
    >
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#15C9BE" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>

      <body
        className={`
          ${hankenGrotesk.variable}
          font-hanken antialiased
          min-h-screen
          bg-background text-foreground
          selection:bg-[#15C9BE]/20 selection:text-foreground
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThirdwebProvider>
            {children}

            {/* Toast notifications – centered, modern look */}
            <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#0a0a0a",
                color: "#ffffff",
                border: "1px solid #1a1a1a",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              },
            }}
            closeButton
            richColors
            expand={false}
            duration={5000}
          />
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}