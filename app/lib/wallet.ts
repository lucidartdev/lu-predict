// lib/wallet.ts
'use client';

import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const metadata = {
  name: "Prediction Market",
  description: "Decentralized Prediction Market dApp",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886?s=200&v=4"]
};

export const chains = [ {
  id: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://base-sepolia.g.alchemy.com/v2/yourkey"
} ] as const;

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  projectId,
  networks: "Base Sepolia",
  features: {
    analytics: true
  }
});