'use client';

import { ReactNode, useState } from 'react';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config';
import { PresightApiProvider } from '@/lib/ApiProvider';
import '@rainbow-me/rainbowkit/styles.css';

if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).litIssuedWarnings ??= new Set();
  ;(globalThis as any).litIssuedWarnings.add(
    'Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.'
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={lightTheme({
            accentColor: '#F7931A',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          <PresightApiProvider>
            {children}
          </PresightApiProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
