**PRESIGHT**

Frontend Developer Documentation

Social Bitcoin Prediction Markets · Mezo Hackathon

Stack **Next.js 14 · TailwindCSS · RainbowKit**

Network **Mezo Testnet (Chain ID 31611)**

Currency **MUSD (ERC-20)**

Deploy Target **Vercel**

Version **1.0.0 - Hackathon MVP**

Date **April 2026**

# **1\. Project Overview**

Presight is a **social Bitcoin prediction market platform** where MUSD is the exclusive staking currency. The frontend is a **Next.js 14** application connecting to Mezo Testnet via **Mezo Passport** (smart account mandate-based gasless staking) and a Node.js/Express backend for real-time group state and yield simulation.

## **1.1 Design Principles**

- **Social-first, stakes-visible, friction-zero.** Feels like a group chat with financial stakes - not a DeFi protocol.
- **No blockchain jargon on primary screens.** Plain language CTAs ("Back YES", "Claim your winnings"). Technical details in expandable panels only.
- **Mobile-first, bottom sheet interactions** for all staking flows.
- **Dark mode primary.** Bitcoin orange (#F7931A) for Full Stake accents, Mezo teal (#00C2A8) for Zero Risk accents.
- **Consumer-grade UX:** new user from invite link to first stake in under 3 minutes.

## **1.2 Visual Identity**

| **Token**             | **Value** | **Usage**                                     |
| --------------------- | --------- | --------------------------------------------- |
| \--color-btc-orange   | #F7931A   | Full Stake Mode accents, CTAs, highlights     |
| \--color-mezo-teal    | #00C2A8   | Zero Risk Mode accents, safe-state indicators |
| \--color-bg-primary   | #0D0D0D   | Main app background (dark mode)               |
| \--color-bg-card      | #1E2A38   | Card surfaces                                 |
| \--color-bg-elevated  | #2E3D50   | Elevated surfaces, modals                     |
| \--color-text-primary | #F4F5F7   | Primary text                                  |
| \--color-text-muted   | #8B96A5   | Secondary / muted text                        |
| \--color-border       | #2E3D50   | Card and input borders                        |
| \--color-success      | #38A169   | Resolved wins                                 |
| \--color-danger       | #E53E3E   | Resolved losses                               |

## **1.3 Typography**

| **Element**      | **Font**       | **Size** | **Weight** | **Notes**                     |
| ---------------- | -------------- | -------- | ---------- | ----------------------------- |
| Display headings | Space Grotesk  | 32-48px  | 700        | Group/market titles           |
| Section headings | Space Grotesk  | 20-24px  | 600        | Page section titles           |
| Body text        | Inter          | 14-16px  | 400        | Descriptions, labels          |
| Numbers/amounts  | JetBrains Mono | 14-32px  | 500-700    | MUSD amounts, counters        |
| Code             | JetBrains Mono | 13px     | 400        | Contract addresses            |
| Badges/tags      | Inter          | 11-12px  | 600        | ZERO RISK / FULL STAKE badges |

# **2\. Architecture & Project Structure**

## **2.1 Project Structure**

presight/

├── app/ # Next.js 14 App Router

│ ├── layout.tsx # Root layout, wallet providers

│ ├── page.tsx # Landing / onboarding entry

│ ├── onboard/page.tsx # Passport connect + mandate setup

│ ├── group/

│ │ ├── \[groupId\]/page.tsx # Group home: active markets list

│ │ └── create/page.tsx # Create group form

│ ├── market/

│ │ ├── \[marketId\]/page.tsx # Market detail + staking flow

│ │ └── create/page.tsx # Create market form

│ └── profile/\[address\]/page.tsx # User prediction profile

├── components/

│ ├── ui/ # Primitives: Button, Badge, Card, Input

│ ├── market/ # MarketCard, StakeBar, StakingSheet

│ ├── group/ # GroupHeader, MemberList, LiveFeed

│ ├── onboard/ # ConnectWallet, MandateSetup, MUSDPrompt

│ └── profile/ # ConvictionScore, StatsGrid, HistoryTable

├── lib/

│ ├── wagmi.ts # Wagmi config, Mezo Testnet chain

│ ├── contracts.ts # ABIs + addresses for all 3 contracts

│ ├── api.ts # Typed API client for backend

│ ├── websocket.ts # WebSocket client + event types

│ └── utils.ts # MUSD formatting, time helpers

├── hooks/

│ ├── useMarket.ts # Market data + WebSocket sync

│ ├── useStake.ts # Stake execution via Passport

│ ├── useYield.ts # Zero Risk yield accrual polling

│ └── useConviction.ts # Conviction Score fetch

├── store/ # Zustand global state

│ ├── walletStore.ts # Wallet + mandate state

│ └── groupStore.ts # Active group + markets cache

├── styles/

│ ├── globals.css # CSS variables, base reset

│ └── tailwind.config.ts # Extended Tailwind config

└── public/

└── fonts/ # Self-hosted Space Grotesk + Inter

## **2.2 Data Flow**

**No blockchain calls from UI.** All on-chain transactions route through Mezo Passport. The frontend never holds private keys or signs transactions directly.

| **Layer**  | **Technology**                         | **Responsibility**                                      |
| ---------- | -------------------------------------- | ------------------------------------------------------- |
| UI Layer   | Next.js 14 App Router                  | Rendering, user interactions, routing                   |
| State      | Zustand + React Query                  | Local app state + server data caching                   |
| Wallet     | wagmi + RainbowKit + Mezo Passport SDK | Wallet connection, mandate setup, gasless stake trigger |
| API Client | fetch + typed client (lib/api.ts)      | Groups, markets, stakes, yield, scores                  |
| Real-Time  | WebSocket (lib/websocket.ts)           | Live stake feed, yield counter, resolution events       |
| Contracts  | viem + wagmi (read-only)               | Balance checks, event reads - NO write calls from UI    |

# **3\. Pages & Routes**

| **Route**                      | **Page**                                                   | **Auth Required** | **Priority** |
| ------------------------------ | ---------------------------------------------------------- | ----------------- | ------------ |
| /onboard                       | Wallet connect + Passport mandate setup + risk preference  | No                |              |
| /                              | Landing / invite redirect - shows group join CTA           | No                |              |
| /group/create                  | Create a new prediction group                              | Yes               |              |
| /group/\[groupId\]             | Group home: active markets, live feed, member list         | Yes               |              |
| /market/create                 | Create a new YES/NO market inside a group                  | Yes               |              |
| /market/\[marketId\]           | Market detail: staking flow, YES/NO bar, yield counter     | Yes               |              |
| /market/\[marketId\]/resolve   | Trusted Resolver resolution interface                      | Resolver only     |              |
| /profile/\[address\]           | Prediction profile: win rate, MUSD stats, Conviction Score | No (public)       |              |
| /group/\[groupId\]/leaderboard | Group leaderboard ranked by Conviction Score               | Yes               |              |

## **3.1 Onboarding Flow (/onboard)**

New user target: invite link → first stake in under 3 minutes. This page must be the fastest path to value.

### **Step 1: Connect Mezo Passport**

- RainbowKit modal, Mezo Passport wallet option prominently first
- On connect: fetch MUSD balance from contract
- **If MUSD balance is zero:** show "Mint MUSD from your BTC" prompt → redirect to Mezo CDP flow → return with balance

### **Step 2: Prediction Mandate Setup**

- Frame as a spending limit, not a smart contract approval: "Allow Presight to stake up to \[X\] MUSD per market"
- Slider input: 1 MUSD minimum, display current MUSD balance as max
- CTA: "Set my limit" → triggers Passport mandate setup via SDK
- Success state: green confirmation, mandate amount displayed

### **Step 3: Risk Preference**

- Two large card options: ZERO RISK (teal) and FULL STAKE (orange)
- Each card shows a one-sentence explanation in plain language
- Selection saved to walletStore - can be changed per market at stake time
- CTA: "Start predicting" → redirect to originating group (if invite link) or /group/create

## **3.2 Group Page (/group/\[groupId\])**

- Header: group name, member count, invite link copy button
- Active markets list: market cards sorted by soonest deadline
- Live stake feed (right sidebar on desktop, bottom tab on mobile) - WebSocket powered
- Resolved markets section (collapsed by default)
- Floating "+ New Market" button (group admin only)

## **3.3 Market Detail (/market/\[marketId\])**

- Full market card at top: question, risk mode badge, resolver identity, deadline countdown
- Large YES/NO stake bar (live, WebSocket-updated)
- Zero Risk Mode: animated yield counter as primary UI element above the stake buttons
- Full Stake Mode: stake amount input (pre-filled with mandate default)
- YES/NO action buttons (minimum 44px touch targets, color + text + icon - 3 independent signals)
- Staking sheet (bottom sheet on mobile): confirmation with exact MUSD amount + mode explanation
- After staking: member positions reveal - can see other participants' directions and amounts

# **4\. Component Reference**

## **4.1 Primitive Components (components/ui/)**

| **Component**          | **Props**                                                                  | **Notes**                                                                    |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| &lt;Button&gt;         | variant: primary\|secondary\|ghost \| size: sm\|md\|lg \| loading: boolean | Primary uses btc-orange. Always show loading spinner during async stake ops. |
| &lt;Badge&gt;          | mode: "zero-risk"\|"full-stake"\|"resolved"\|"pending" \| text: string     | NEVER use color alone - always color + text. Accessible.                     |
| &lt;Card&gt;           | elevated?: boolean \| clickable?: boolean \| padding?: sm\|md\|lg          | bg-card base, bg-elevated when elevated prop set.                            |
| &lt;Input&gt;          | type: text\|number \| label: string \| suffix?: string \| error?: string   | Number inputs for MUSD always show "MUSD" suffix.                            |
| &lt;BottomSheet&gt;    | isOpen: boolean \| onClose: () => void \| title: string                    | All mobile staking flows use this. Animate from bottom.                      |
| &lt;Toast&gt;          | type: success\|error\|info \| message: string \| duration?: number         | All stake/resolution events trigger a toast.                                 |
| &lt;Avatar&gt;         | address: string \| size?: sm\|md\|lg                                       | Generates deterministic color + initials from wallet address.                |
| &lt;CountdownTimer&gt; | deadline: Date \| size?: sm\|lg                                            | Teal when >24h remaining, orange <24h, red <1h.                              |
| &lt;MUSDAmount&gt;     | amount: bigint \| size?: sm\|md\|lg \| showSign?: boolean                  | JetBrains Mono font. Always 2 decimal places.                                |

## **4.2 Market Components (components/market/)**

### **MarketCard**

Summary card shown in group market list. Displays at a glance: question, YES/NO bar, total MUSD staked, risk mode badge, resolver identity, time remaining.

- &lt;MarketCard marketId={id} onClick={...} /&gt;
- Props: marketId (string), showResolverBadge (boolean, default true), compact (boolean for list vs featured)
- Live YES/NO bar updates via WebSocket - no polling
- Risk mode badge: ZERO RISK (teal) / FULL STAKE (orange) - both color AND text label

### **StakeBar**

Animated horizontal progress bar showing YES vs NO split in real time.

- YES side: btc-orange. NO side: mezo-teal. Both labeled with percentage + MUSD total.
- Smoothly animates when new stakes arrive via WebSocket
- Props: yesAmount (bigint), noAmount (bigint), animated (boolean)

### **YieldCounter**

The most prominent UI element on Zero Risk market screens. Shows live accruing yield.

- Displays: "Yield accruing: 0.42 MUSD ↑" in Mezo teal
- **Updates every 30 seconds** via polling useYield hook (not WebSocket - simulated calculation)
- Subtle upward tick animation on each update to make accrual feel alive
- Below counter: "Your 500 MUSD principal is always safe" in muted text
- Props: userAddress (string), marketId (string), troveBalance (bigint)

### **StakingSheet**

Bottom sheet (mobile) / modal (desktop) that appears when user taps YES or NO.

- Full Stake Mode: shows amount, direction, "Executing via Passport mandate - no gas required"
- Zero Risk Mode: shows yield amount, "Staking 0.42 MUSD of yield - your principal is safe"
- Confirm button triggers useStake hook → Passport gasless execution
- Loading state: spinner + "Staking..." text. Success: green checkmark + MUSD amount won potentially.

## **4.3 Group Components (components/group/)**

| **Component**          | **Description**                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| &lt;GroupHeader&gt;    | Group name, member count, invite link copy button (generates shareable URL)                       |
| &lt;LiveFeed&gt;       | Real-time stake event feed. Each event: avatar, "backed YES/NO", amount, time. WebSocket-powered. |
| &lt;MemberList&gt;     | Group members list with Conviction Score ranking. Truncated to top 5, expandable.                 |
| &lt;InviteLinkCard&gt; | Prominent card with invite URL + copy button. Shown to group admin on group creation.             |
| &lt;ResolverBadge&gt;  | Inline badge on market cards showing resolver's address (truncated) + "Resolver" label.           |

## **4.4 Profile Components (components/profile/)**

| **Component**             | **Description**                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------- |
| &lt;ConvictionScore&gt;   | Large animated score display. Ring chart showing score breakdown. Shareable via link.  |
| &lt;StatsGrid&gt;         | Four metric cards: Markets Played, Win Rate (%), Total Staked (MUSD), Total Won (MUSD) |
| &lt;PredictionHistory&gt; | Paginated table of past markets: question, direction, stake, outcome, MUSD won/lost    |
| &lt;GroupLeaderboard&gt;  | Ranked list of group members by Conviction Score. Highlights current user.             |

# **5\. Custom Hooks**

## **5.1 useStake**

Core hook for executing MUSD stakes via Mezo Passport mandate. Used in StakingSheet.

const { stake, isPending, isSuccess, error } = useStake();

await stake({

marketId: '0x...',

direction: 'YES' | 'NO',

amount: BigInt(10_000_000), // in MUSD wei

mode: 'full-stake' | 'zero-risk',

});

- Calls backend /api/stake which validates mandate scope before triggering Passport
- **Never calls contracts directly from the frontend.** All transactions go through backend → Passport → contract.
- On success: invalidates market query cache, fires toast notification

## **5.2 useMarket**

Fetches market data and subscribes to WebSocket updates.

const { market, isLoading } = useMarket(marketId);

// market: { id, question, yesAmount, noAmount, mode,

// deadline, resolverAddress, status, stakes\[\] }

- React Query for initial fetch + cache
- WebSocket subscription for live YES/NO bar updates (yesAmount, noAmount)
- Auto-updates MarketCard without re-fetch on stake events

## **5.3 useYield**

Zero Risk Mode yield accrual simulation. Polls backend every 30 seconds.

const { yieldAmount, isAccruing } = useYield({

userAddress: '0x...',

marketId: '0x...',

});

// yieldAmount: BigInt - accrued MUSD since market open

- Backend calculates yield based on user's declared trove balance × time-based rate
- 30-second polling interval - matches YieldCounter UI refresh rate
- Returns 0n if user has no active mandate or trove position

## **5.4 useConviction**

const { score, rank, totalParticipants } = useConviction(userAddress, groupId);

- Conviction Score: weighted accuracy (higher-stake correct calls score more than low-stake ones)
- Stale-while-revalidate - score updates after each market resolution

## **5.5 useMandateStatus**

const { hasMandateSet, mandateLimit, setupMandate } = useMandateStatus();

- Reads mandate status from walletStore (persisted in localStorage)
- setupMandate(limitAmount) → calls Mezo Passport SDK to register mandate on-chain
- Middleware: any staking action checks this hook and redirects to /onboard if mandate not set

# **6\. Wallet Integration & Contracts**

## **6.1 Wagmi Configuration**

// lib/wagmi.ts

export const mezoTestnet = defineChain({

id: 31611,

name: 'Mezo Testnet',

nativeCurrency: { name: 'BTC', symbol: 'BTC', decimals: 18 },

rpcUrls: {

default: { http: \['<https://rpc.mezo.testnet'\>] },

},

});

export const config = createConfig({

chains: \[mezoTestnet\],

connectors: \[mezoPassportConnector()\],

transports: { \[mezoTestnet.id\]: http() },

});

## **6.2 Contract Addresses & ABIs**

// lib/contracts.ts

export const CONTRACTS = {

PredictionMarket: {

address: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS,

abi: predictionMarketAbi, // from typechain or hardhat artifacts

},

GroupRegistry: {

address: process.env.NEXT_PUBLIC_GROUP_REGISTRY_ADDRESS,

abi: groupRegistryAbi,

},

MUSD: {

address: process.env.NEXT_PUBLIC_MUSD_ADDRESS,

abi: erc20Abi, // standard ERC-20

},

};

## **6.3 Read-Only Contract Usage (Frontend)**

The frontend ONLY reads from contracts (balances, events). All writes go through the backend → Mezo Passport path. This is a security requirement.

// ✅ CORRECT - read-only

const { data: musdBalance } = useReadContract({

...CONTRACTS.MUSD,

functionName: 'balanceOf',

args: \[userAddress\],

});

// ❌ NEVER do this from the frontend

const { writeContract } = useWriteContract(); // Do NOT use for staking

## **6.4 Environment Variables**

| **Variable**                          | **Description**                               | **Required** |
| ------------------------------------- | --------------------------------------------- | ------------ |
| NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS | PredictionMarket.sol deployed address         | Yes          |
| NEXT_PUBLIC_GROUP_REGISTRY_ADDRESS    | GroupRegistry.sol deployed address            | Yes          |
| NEXT_PUBLIC_MUSD_ADDRESS              | MUSD ERC-20 contract address                  | Yes          |
| NEXT_PUBLIC_BACKEND_URL               | Backend API base URL (Railway)                | Yes          |
| NEXT_PUBLIC_WS_URL                    | WebSocket server URL (Railway)                | Yes          |
| NEXT_PUBLIC_MEZO_CDP_URL              | Mezo CDP portal URL for MUSD minting redirect | Yes          |
| NEXT_PUBLIC_CHAIN_ID                  | 31611 (Mezo Testnet)                          | Yes          |

# **7\. Backend API Integration**

## **7.1 API Client (lib/api.ts)**

Typed wrapper around all backend endpoints. Never call fetch() directly - always use this client.

// Groups

api.groups.create(name: string) → { groupId, inviteLink }

api.groups.get(groupId) → Group

api.groups.join(groupId) → void

// Markets

api.markets.create({ groupId, question, deadline, mode, resolverAddress })

api.markets.get(marketId) → Market

api.markets.list(groupId) → Market\[\]

// Stakes

api.stakes.place({ marketId, direction, amount, mode })

→ validates mandate → executes via Passport → txHash

// Yield

api.yield.get(userAddress, marketId) → { amount: bigint }

// Resolver

api.resolver.resolve(marketId, outcome: 'YES' | 'NO') → txHash

// Profile

api.profile.get(userAddress) → UserProfile

api.profile.leaderboard(groupId) → LeaderboardEntry\[\]

## **7.2 WebSocket Events (lib/websocket.ts)**

| **Event Type**    | **Payload**                                             | **Consumer Component**        |
| ----------------- | ------------------------------------------------------- | ----------------------------- |
| stake:placed      | { marketId, direction, amount, userAddress, timestamp } | StakeBar, LiveFeed            |
| market:updated    | { marketId, yesAmount, noAmount, participantCount }     | MarketCard, StakeBar          |
| market:resolved   | { marketId, outcome, winnerCount, totalPool }           | MarketCard → resolution toast |
| yield:tick        | { marketId, userAddress, accruedAmount }                | YieldCounter                  |
| resolver:assigned | { marketId, resolverAddress }                           | ResolverBadge                 |

// lib/websocket.ts - usage

const ws = useWebSocket();

ws.subscribe('stake:placed', (event) => {

// updates MarketCard YES/NO bar in real time

queryClient.invalidateQueries(\['market', event.marketId\]);

});

ws.subscribe('yield:tick', (event) => {

// updates YieldCounter every 30s

updateYieldStore(event.userAddress, event.accruedAmount);

});

# **8\. Critical User Flows**

## **8.1 New User Onboarding (Target: ≤3 min)**

- Receive WhatsApp/Telegram invite link → land on /group/\[groupId\]
- If no wallet: show "Join with Bitcoin wallet" → tap → RainbowKit opens
- Connect Mezo Passport wallet
- **MUSD balance check:** if zero → "Mint MUSD from your BTC" banner → tap → Mezo CDP redirect → return with balance
- Mandate setup: slider to set max MUSD per market → "Set my limit" → Passport mandate registered
- Risk preference: ZERO RISK card or FULL STAKE card → save to store
- "Start predicting" → redirected to group page → ready to stake

## **8.2 Zero Risk Staking Flow**

- Group page → tap a ZERO RISK market card → market detail page
- See: question, yield counter "Yield accruing: 0.42 MUSD ↑" (teal, animated)
- Tap "Back YES" or "Back NO"
- StakingSheet opens: "You are staking 0.42 MUSD of yield - your 500 MUSD principal is always safe"
- Tap "Confirm Stake" → gasless execution via Passport mandate → toast "Stake placed!"
- Position appears in Live Feed. YES/NO bar updates in real time.
- **On resolution win:** toast "You won X MUSD. Credited to your wallet." (automatic - 0 clicks)
- **On resolution loss:** toast "Yield stake didn't win - your 500 MUSD principal is untouched."

## **8.3 Full Stake Flow**

- Group page → tap a FULL STAKE market card
- See: question, current YES/NO split, total MUSD pool
- Stake amount input (pre-filled with mandate default), tap YES or NO
- StakingSheet: "Staking 50 MUSD on YES. Potential reward: proportional share of NO pool."
- Confirm → gasless execution → stake visible in Live Feed with amount

## **8.4 Trusted Resolver Resolution Flow**

- After market deadline: resolver sees "Resolve Market" CTA on market detail page (only visible to assigned resolver)
- Tap "Resolve" → bottom sheet shows: YES or NO outcome selector + "This is irreversible" warning
- Select outcome → "Confirm Resolution" → calls api.resolver.resolve()
- Backend triggers on-chain resolution → contract auto-distributes MUSD to winners
- All participants receive resolution toast notification
- Market card updates to RESOLVED state with outcome badge

# **9\. Accessibility & Performance**

## **9.1 Accessibility Requirements (WCAG 2.1 AA)**

All requirements below are mandatory for demo readiness. Test with VoiceOver (iOS) and Android TalkBack.

| **Requirement**      | **Implementation**                                                               | **Test Method**                     |
| -------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| Contrast ratios (AA) | All text on dark bg: minimum 4.5:1. Use --color-text-primary on --color-bg-card. | Chrome DevTools accessibility panel |
| Risk mode badges     | NEVER color alone - always ZERO RISK / FULL STAKE text + color + distinct icon   | Manual: test with grayscale mode    |
| YES/NO buttons       | Three independent signals: color (orange/teal) + text ("YES"/"NO") + icon (✓/✗)  | Manual: test with grayscale mode    |
| Touch targets        | Minimum 44×44px for all interactive elements (stake inputs, YES/NO buttons)      | Tap Target checker (Lighthouse)     |
| Form labels          | All inputs have visible &lt;label&gt; elements, not just placeholder text        | Manual inspection                   |
| Toast notifications  | Both visual (toast) AND text confirmation - never visual only                    | Screen reader test                  |
| Focus management     | Bottom sheet traps focus when open. Escape closes. Focus returns to trigger.     | Keyboard navigation test            |

## **9.2 Performance Targets**

| **Metric**                          | **Target**       | **Notes**                           |
| ----------------------------------- | ---------------- | ----------------------------------- |
| Frontend load time (LCP)            | ≤2 seconds       | On Mezo Testnet, 4G connection      |
| WebSocket stake update latency      | ≤500ms           | From backend push to UI update      |
| Yield counter refresh               | Every 30 seconds | useYield polling interval           |
| Stake tx time (Passport mandate)    | ≤3 seconds       | From confirm tap to success toast   |
| Market resolution → UI update       | ≤30 seconds      | On-chain event → WebSocket → toast  |
| Time to first prediction (new user) | ≤3 minutes       | Invite link → first stake confirmed |

## **9.3 Mobile-First Implementation Notes**

- All staking flows use &lt;BottomSheet&gt; on viewport width < 768px
- Bottom navigation bar for mobile: Group | Markets | Profile | Leaderboard
- Full-screen market detail on mobile - stake bar and action buttons always in viewport without scrolling
- YieldCounter on Zero Risk mobile: full-width teal banner at top of market detail screen
- Number inputs: type="decimal" on mobile to trigger numeric keyboard with decimal point

# **10\. State Management**

## **10.1 Zustand Stores**

### **walletStore**

interface WalletStore {

address: string | null;

musdBalance: bigint;

hasMandateSet: boolean;

mandateLimit: bigint; // max MUSD per market

defaultRiskMode: 'zero-risk' | 'full-stake';

troveBalance: bigint; // for Zero Risk yield calculation

}

### **groupStore**

interface GroupStore {

activeGroupId: string | null;

groups: Record&lt;string, Group&gt;;

markets: Record&lt;string, Market&gt;; // keyed by marketId

liveFeeds: Record&lt;string, StakeEvent\[\]&gt;; // keyed by groupId

}

## **10.2 React Query Cache Keys**

| **Query Key**                      | **Data**                     | **Stale Time**               |
| ---------------------------------- | ---------------------------- | ---------------------------- |
| \['group', groupId\]               | Group metadata + members     | 30 seconds                   |
| \['market', marketId\]             | Market detail + stake totals | 5 seconds (real-time via WS) |
| \['markets', groupId\]             | All markets for a group      | 15 seconds                   |
| \['yield', userAddress, marketId\] | Accrued yield amount         | 30 seconds (polling)         |
| \['profile', userAddress\]         | Stats + history + score      | 60 seconds                   |
| \['leaderboard', groupId\]         | Group leaderboard            | 60 seconds                   |
| \['musdBalance', userAddress\]     | MUSD wallet balance          | 10 seconds                   |

# **11\. Development Setup**

## **11.1 Installation**

git clone <https://github.com/your-org/presight>

cd presight

npm install

\# Copy environment variables

cp .env.example .env.local

\# Fill in contract addresses from backend team after Week 1 deploy

## **11.2 Running Locally**

\# Start frontend dev server

npm run dev # <http://localhost:3000>

\# Build for production

npm run build

npm run start

\# Type check

npm run type-check

\# Lint

npm run lint

## **11.3 Dependency Checklist**

| **Package**            | **Version** | **Purpose**                                                 |
| ---------------------- | ----------- | ----------------------------------------------------------- |
| next                   | 14.x        | Framework                                                   |
| react, react-dom       | 18.x        | UI library                                                  |
| tailwindcss            | 3.x         | Styling                                                     |
| wagmi                  | 2.x         | Ethereum hooks                                              |
| viem                   | 2.x         | Low-level Ethereum client                                   |
| @rainbow-me/rainbowkit | 2.x         | Wallet connection UI                                        |
| zustand                | 4.x         | Global state                                                |
| @tanstack/react-query  | 5.x         | Server state + caching                                      |
| framer-motion          | 11.x        | Animations (yield counter, transitions)                     |
| mezo-passport-sdk      | latest      | Passport mandate integration - confirm version with BE team |

## **11.4 Vercel Deployment**

- Connect GitHub repo to Vercel. Auto-deploys on push to main.
- Set all NEXT*PUBLIC*\* env vars in Vercel project settings
- Ensure Mezo Testnet RPC is accessible from Vercel edge region
- **Demo URL format:** <https://presight.vercel.app> - share with backend team for integration testing

# **12\. Testing & Demo Checklist**

## **12.1 Week 2 UI Sign-off Checklist**

- \[ \] Onboarding: connect → mandate → risk preference in under 3 minutes
- \[ \] Group creation: name → invite link generated and copyable
- \[ \] Market creation: all fields, resolver assignment working
- \[ \] Market card: question, YES/NO bar, risk badge, resolver visible at a glance
- \[ \] Full Stake staking: YES/NO → sheet → confirm → stake recorded → bar updates
- \[ \] Two distinct wallets can stake on same market
- \[ \] Trusted Resolver: resolution CTA visible only to assigned resolver
- \[ \] Auto-distribution: MUSD appears in winner wallet after resolution

## **12.2 Week 3 Feature Checklist**

- \[ \] Zero Risk Mode: ZERO RISK badge visible and correct color
- \[ \] Yield counter: shows "Yield accruing: X MUSD ↑", updates every 30s
- \[ \] Zero Risk stake confirmation: explicitly states principal is safe
- \[ \] Zero Risk loss notification: explicitly states principal is untouched
- \[ \] Live feed: stake events appear within 500ms of placement
- \[ \] Member positions: hidden until own stake placed, then visible
- \[ \] Conviction Score: visible on profile page
- \[ \] Mobile: all staking flows use bottom sheet, all touch targets ≥44px

## **12.3 Week 4 Demo Dry Run Checklist**

- \[ \] 5 full cycles completed: create → stake → resolve → auto-distribute
- \[ \] Both risk modes demonstrated in same demo session
- \[ \] 2 distinct wallets both active in the same market
- \[ \] 1% fee deducted and routed to protocol address on every resolution
- \[ \] MUSD reward appears in winner wallet within 30 seconds of resolution
- \[ \] Fallback video recorded: 90-second Zero Risk Mode complete cycle
- \[ \] Non-crypto user tested: Maya persona, under 3 minutes to first stake
- \[ \] Zero Risk counter comprehension test: "Is your principal at risk?" → 100% correct

Demo order: (1) Zero Risk market - show yield counter, stake with Wallet A + B, resolve, show 0 principal change. (2) Full Stake market - meaningful MUSD pool, resolve, show auto-distribution. (3) Conviction Score on profile.

# **13\. Feature Priority Quick Reference**

| **Feature**                        | **Components / Hooks**                  | **Priority** | **Week** |
| ---------------------------------- | --------------------------------------- | ------------ | -------- |
| MUSD staking - Full Stake Mode     | StakingSheet, useStake, MUSDAmount      |              | W2       |
| Mezo Passport mandate setup        | MandateSetup, useMandateStatus          |              | W1       |
| Group creation + invite link       | GroupHeader, InviteLinkCard, api.groups |              | W2       |
| YES/NO market creation             | Market create page, api.markets         |              | W2       |
| Trusted Resolver assignment + UI   | ResolverBadge, resolve page             |              | W2       |
| Auto-distribution toast            | Toast, market:resolved WS event         |              | W2       |
| 1% fee display on confirmation     | StakingSheet                            |              | W2       |
| Zero Risk Mode - yield counter     | YieldCounter, useYield                  |              | W3       |
| Zero Risk badge + mode-specific UI | Badge, market detail treatment          |              | W3       |
| Live stake feed (WebSocket)        | LiveFeed, websocket.ts                  |              | W3       |
| Prediction history + win rate      | PredictionHistory, StatsGrid            |              | W3       |
| Conviction Score display           | ConvictionScore, useConviction          |              | W3       |
| Mobile bottom sheet flows          | BottomSheet, mobile layout              |              | W3       |
| Group leaderboard                  | GroupLeaderboard                        |              | W4       |
| Shareable "I won" result card      | ResultCard share component              |              | W4       |
| Win-streak notification            | Toast variant                           |              | W4       |