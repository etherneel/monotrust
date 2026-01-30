import { createThirdwebClient } from "thirdweb"
import { bsc, bscTestnet } from "thirdweb/chains"
import { createWallet } from "thirdweb/wallets"

// Your Thirdweb client ID
const CLIENT_ID = "1553c696c4e118eecbc8c01c0c6e8e28"

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: CLIENT_ID,
})

// Supported wallets configuration using createWallet
export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
  createWallet("com.trustwallet.app"),
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
  createWallet("app.phantom"),
  createWallet("io.rabby"),
]

// Chain configuration - Only BSC Testnet
export const supportedChains = [
  {
    id: 97,
    name: "BSC Testnet",
    symbol: "tBNB",
    icon: "🟡",
    chain: bscTestnet,
  },
  // {
  //   id: 56,
  //   name: "BSC Mainnet",
  //   symbol: "BNB",
  //   icon: "🟡",
  //   chain: bsc,
  // },
]

// Export the chain for easy access
export const defaultChain = bscTestnet
