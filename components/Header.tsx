'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-400">
      <div className="text-white text-2xl font-bold">Presight</div>
      <ConnectButton />
    </header>
  );
}
