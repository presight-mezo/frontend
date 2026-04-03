# Presight Frontend

A modern Web3-enabled frontend built with **Next.js 14**, **TailwindCSS**, and **RainbowKit** for seamless wallet integration.

## 🚀 Features

- ✨ **Next.js 14** with App Router and TypeScript
- 🎨 **TailwindCSS** for styling
- 🔗 **RainbowKit** for wallet connection UI
- 💎 **Wagmi** for Web3 utilities
- ⛓️ **Viem** for Ethereum interactions
- 📦 **Query Client** for efficient data fetching
- 🔍 **ESLint** for code quality

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your WalletConnect Project ID to `.env.local`:
   - Get a Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Update `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

## 🏃 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Production Build

Build for production:
```bash
npm run build
npm run start
```

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── providers.tsx       # RainbowKit & Wagmi config
├── components/
│   ├── Header.tsx          # Header with wallet connection
│   └── ...                 # Additional components
├── public/                 # Static assets
├── .env.example            # Environment template
└── package.json            # Dependencies
```

## 🔗 Supported Networks

- Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Sepolia (testnet, optional)

## 🪝 Wagmi Hooks

Use Wagmi hooks for Web3 interactions:

```typescript
import { useAccount, useBalance, useContractRead } from 'wagmi';

export function MyComponent() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  return (
    <div>
      {isConnected && <p>Balance: {balance?.formatted}</p>}
    </div>
  );
}
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)

## 🔧 Configuration

### RainbowKit Setup

The RainbowKit configuration is in `app/providers.tsx`. Modify wallet options and chains as needed:

```typescript
const config = getDefaultConfig({
  appName: 'Presight Frontend',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
```

### TailwindCSS

Customize TailwindCSS in `tailwind.config.ts`.

### ESLint

Extend ESLint rules in `.eslintrc.json`.

## 🚀 Deployment

Deploy easily to Vercel:

```bash
vercel deploy
```

Or use any Node.js hosting provider (AWS, Heroku, etc.).

## 📝 License

This project is open source and available under the MIT License.
