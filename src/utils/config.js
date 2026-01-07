import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import {injected, metaMask, walletConnect} from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
  },
})