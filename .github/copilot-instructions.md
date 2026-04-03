# Presight Frontend

Next.js 14 project with TailwindCSS and RainbowKit for Web3 wallet integration.

## Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- RainbowKit (Web3 wallet connection)
- Wagmi (Web3 utilities)
- Viem (Ethereum utilities)
- ESLint

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production
```bash
npm run build
npm run start
```

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `providers.tsx` - RainbowKit and Wagmi configuration
- `public/` - Static assets
- `styles/` - Global styles

## Web3 Integration
The project includes RainbowKit for wallet connection. The provider is configured in `providers.tsx` and wrapped around your app in the root layout.

## Setup Completed
✅ Project scaffolded with Next.js 14, TypeScript, TailwindCSS, and ESLint
✅ RainbowKit + Wagmi + Viem installed and configured
✅ Root layout updated with Providers wrapper
✅ Header component with ConnectButton created
✅ Home page with Web3 integration example
✅ Environment configuration files created
✅ Production build verified successfully
✅ README documentation completed
