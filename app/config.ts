import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from 'wagmi/chains';
import { type Chain } from 'viem';

const mezoTestnet = {
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BTC',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.test.mezo.org'] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.test.mezo.org' },
  },
  testnet: true,
} as const satisfies Chain;

const { wallets } = getDefaultWallets();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// We define the static configuration object
const configOptions = {
  appName: 'Presight Frontend',
  projectId,
  chains: [
    mezoTestnet,
  ],
  ssr: true,
} as const;

// Ensure `getDefaultConfig` is called only once on the client
export const config = (() => {
  if (typeof window !== 'undefined') {
    const globalAny = window as any;
    if (!globalAny.__WAGMI_CONFIG__) {
      globalAny.__WAGMI_CONFIG__ = getDefaultConfig(configOptions as any);
    }
    return globalAny.__WAGMI_CONFIG__;
  }
  
  // Always instantiate on the server side
  return getDefaultConfig(configOptions as any);
})();
