'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useMandate, useTrove } from '@/hooks/useApi';
import { parseEther, formatUnits } from 'viem';

/* ─── Types ──────────────────────────────────────────────────── */
type Mode = 'zero-risk' | 'full-stake' | null;

/* ─── Per-screen accent colours (Limoncello palette) ────────── */
const SCREEN_COLORS = [
  '#F7C948', // Screen 1 — sunflower yellow
  '#4FC3F7', // Screen 2 — sky blue
  '#52A791', // Screen 3 — teal green
  '#F97316', // Screen 4 — amber orange
  '#EF476F', // Screen 5 — strawberry pink
];

/* ─── Floating Tags Background ───────────────────────────────── */
const BG_TAGS = [
  { text: 'FRONTEND', color: 0 },
  { text: 'UX', color: 1 },
  { text: 'VIBE CHECK', color: 2 },
  { text: 'CLEAN CODE', color: 1 },
  { text: 'CREATIVE', color: 0 },
  { text: 'MOTION', color: 2 },
  { text: 'TASTE', color: 2 },
  { text: 'TYPE SYSTEMS', color: 1 },
  { text: 'KEYFRAMES', color: 0 },
  { text: 'BUILDS', color: 1 },
  { text: 'CASE STUDIES', color: 0 },
  { text: 'SCROLL LOVE', color: 2 },
  { text: 'TORONTO CORE', color: 1 },
  { text: 'STUDIO VIBES', color: 0 },
  { text: 'GSAP FANBOY', color: 2 },
  { text: 'NO FILLER', color: 1 },
  { text: 'LIVE SITES', color: 0 },
  { text: 'CANADA MODE', color: 2 },
  { text: 'UI NERD', color: 0 },
  { text: 'QUIETLY BOLD', color: 1 },
  { text: 'SHIPPED', color: 0 },
  { text: 'BITCOIN', color: 2 },
  { text: 'MUSD', color: 1 },
  { text: 'PREDICTIONS', color: 0 },
  { text: 'ZERO RISK', color: 2 },
  { text: 'SOCIAL', color: 1 },
  { text: 'COMMUNITY', color: 0 },
  { text: 'MEZO', color: 2 },
  { text: 'GASLESS', color: 1 },
  { text: 'YIELD', color: 0 },
  { text: 'STAKE', color: 2 },
  { text: 'WALLET', color: 1 },
  { text: 'ON-CHAIN', color: 0 },
  { text: 'MARKETS', color: 2 },
  { text: 'PRESIGHT', color: 1 },
  { text: 'DARK MODE', color: 0 },
  { text: 'WEB3', color: 2 },
];

const TAG_COLORS = [
  { bg: '#f9c8c8', border: 'rgba(139,58,58,0.18)', text: '#8b3a3a' },  // soft pink
  { bg: '#c8d9f9', border: 'rgba(42,74,139,0.18)', text: '#2a4a8b' },  // soft blue
  { bg: '#f9e8c8', border: 'rgba(139,90,42,0.18)', text: '#8b5a2a' },  // soft amber
];

function FloatingTagsBackground({ continueSignal }: { continueSignal: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const speedBoostRef = useRef(false);
  const speedRef = useRef(1);       // current interpolated speed multiplier
  const isFirstMount = useRef(true);

  /* Trigger speed boost on every Continue click (signal increment) */
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    speedBoostRef.current = true;
    const t = setTimeout(() => { speedBoostRef.current = false; }, 2200);
    return () => clearTimeout(t);
  }, [continueSignal]);

  /* Build tags + run animation loop once on mount */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    type TagObj = {
      x: number; y: number;
      vx: number; vy: number;
      layer: number;
      el: HTMLSpanElement;
    };

    const tags: TagObj[] = BG_TAGS.map((tag, i) => {
      const el = document.createElement('span');
      const c = TAG_COLORS[tag.color];
      el.textContent = tag.text;
      el.style.cssText = [
        'position:absolute',
        'top:0', 'left:0',
        'font-size:11px',
        'font-weight:700',
        'letter-spacing:0.07em',
        'text-transform:uppercase',
        `background:${c.bg}`,
        `color:${c.text}`,
        `border:1.5px solid ${c.border}`,
        'border-radius:100px',
        'padding:5px 13px',
        'white-space:nowrap',
        'pointer-events:none',
        'user-select:none',
        'will-change:transform',
        'font-family:inherit',
      ].join(';');
      container.appendChild(el);

      const layer = i % 3; // 0 = slowest/back, 2 = fastest/front
      const x = Math.random() * W;
      const y = Math.random() * H;

      // Base drift speed scales slightly with layer for depth feel
      const baseSpd = 0.06 + layer * 0.035;
      // Mostly horizontal (rightward) with gentle vertical wobble
      const vx = baseSpd * (0.5 + Math.random() * 0.5);
      const vy = (Math.random() - 0.5) * baseSpd * 0.6;

      return { x, y, vx, vy, layer, el };
    });

    /* Mouse tracking for parallax */
    const mouse = { x: W / 2, y: H / 2 };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; };
    window.addEventListener('resize', onResize);

    let rafId: number;
    let prev = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - prev) / 16.67, 4); // cap delta so paused tabs don't explode
      prev = now;

      /* Lerp speed toward target for smooth ease in/out */
      const targetSpeed = speedBoostRef.current ? 3.5 : 1;
      speedRef.current += (targetSpeed - speedRef.current) * 0.04 * dt;
      const s = speedRef.current;

      /* Parallax: distance from center, scaled per layer */
      const cx = mouse.x - W / 2;
      const cy = mouse.y - H / 2;

      tags.forEach(tag => {
        tag.x += tag.vx * dt * s;
        tag.y += tag.vy * dt * s;

        // Wrap around viewport
        const elW = tag.el.offsetWidth || 90;
        const elH = tag.el.offsetHeight || 28;
        if (tag.x > W + elW) tag.x = -elW;
        if (tag.x < -elW) tag.x = W + elW;
        if (tag.y > H + elH) tag.y = -elH;
        if (tag.y < -elH) tag.y = H + elH;

        // Parallax offset: layer 0 barely moves, layer 2 moves most
        const depth = (tag.layer - 1) * 0.018;
        const px = cx * depth;
        const py = cy * depth;

        tag.el.style.transform = `translate3d(${tag.x + px}px,${tag.y + py}px,0)`;
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      tags.forEach(t => t.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'white',
      }}
    />
  );
}

/* ─── Limoncello Card ─────────────────────────────────────────
   A card with a left accent border that floods with the accent
   colour on hover (matching the limoncello.studio effect).
──────────────────────────────────────────────────────────────── */
function LimonCard({
  accent,
  icon,
  title,
  desc,
  delay = 0,
  tags,
}: {
  accent: string;
  icon?: string;
  title: string;
  desc?: string;
  delay?: number;
  tags?: string[];
}) {
  const hovered = false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        borderRadius: 0,
        borderBottom: `1px solid rgba(0,0,0,0.08)`,
        borderLeft: `4px solid ${accent}`,
        padding: '18px 20px',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'background 0.35s cubic-bezier(0.25,0.1,0.25,1)',
        background: hovered ? accent : '#f8f8f7',
      }}
    >
      {/* Icon */}
      {icon && (
        <span
          style={{
            fontSize: 22,
            flexShrink: 0,
            marginTop: 2,
            transition: 'filter 0.35s',
            filter: hovered ? 'brightness(0) invert(1)' : 'none',
          }}
        >
          {icon}
        </span>
      )}

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: hovered ? '#0a0a0a' : '#0a0a0a',
            marginBottom: desc ? 3 : 0,
            transition: 'color 0.35s',
          }}
        >
          {title}
        </div>
        {desc && (
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              color: hovered ? 'rgba(0,0,0,0.65)' : '#666',
              transition: 'color 0.35s',
            }}
          >
            {desc}
          </div>
        )}
        {tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: `1px solid ${hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
                  borderRadius: 3,
                  padding: '3px 7px',
                  color: hovered ? '#0a0a0a' : '#555',
                  transition: 'all 0.35s',
                  background: 'transparent',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow icon */}
      <div
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `1.5px solid ${hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: hovered ? '#0a0a0a' : '#555',
          transition: 'all 0.35s',
          alignSelf: 'center',
          marginLeft: 8,
        }}
      >
        ↗
      </div>
    </motion.div>
  );
}

/* ─── Step Indicator ─────────────────────────────────────────── */
function StepDots({
  current,
  total,
  accent,
}: {
  current: number;
  total: number;
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            background: i === current ? accent : 'rgba(0,0,0,0.15)',
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ height: 6, borderRadius: 100 }}
        />
      ))}
    </div>
  );
}

/* ─── Slide-Fill Button (matches Insightly Explore hover) ───── */
function SlideButton({
  onClick,
  disabled = false,
  accent,
  children,
  delay = 0,
  fullWidth = true,
}: {
  onClick?: () => void;
  disabled?: boolean;
  accent: string;
  children: React.ReactNode;
  delay?: number;
  fullWidth?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: disabled ? 'rgba(0,0,0,0.10)' : accent,
        color: disabled ? 'rgba(0,0,0,0.3)' : hovered ? '#fff' : '#0a0a0a',
        border: 'none',
        borderRadius: 16,
        padding: '15px 28px',
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        display: 'block',
        width: fullWidth ? '100%' : undefined,
        transition: 'color 0.45s cubic-bezier(0.19,1,0.22,1)',
      }}
    >
      {/* Sliding fill overlay */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          transform: hovered && !disabled ? 'translateX(0)' : 'translateX(-101%)',
          transition: 'transform 0.5s cubic-bezier(0.19,1,0.22,1)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Text content */}
      <span style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </span>
    </motion.button>
  );
}

/* ─── Slide wrapper ──────────────────────────────────────────── */
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/* ─── Screen 1 — Welcome / Invite context ────────────────────── */
function Screen1({ onNext, accent, inviter, groupName }: { onNext: () => void; accent: string; inviter?: string | null; groupName?: string | null }) {
  const values = [
    {
      title: 'Social-first markets',
      desc: 'Predict alongside your circle, not faceless strangers.',
    },
    {
      title: 'Only your yield is ever at stake',
      desc: 'Your Bitcoin principal stays safe, always. Only the interest plays.',
    },
    {
      title: 'Bitcoin-native, gasless',
      desc: 'Stake in MUSD, the native Mezo stablecoin. Zero gas limits.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Invite pill — Only shows if params exist */}
      {inviter && groupName && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `${accent}18`,
            border: `1px solid ${accent}55`,
            borderRadius: 100,
            padding: '6px 14px',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            👤
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
            {inviter} invited you to <strong>{groupName}</strong>
          </span>
        </motion.div>
      )}

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px,5vw,40px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            marginBottom: 12,
          }}
        >
          Predict with your squad.
          <br />
          Earn from conviction.
        </h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.65, maxWidth: 600 }}>
          Presight is a social prediction market. Bet on real-world outcomes, earn MUSD yield — and
          bring your group chat with you.
        </p>
      </motion.div>

      {/* Value props — Limoncello cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', borderRadius: 16 }}
      >
        {values.map((v, i) => (
          <LimonCard
            key={i}
            accent={accent}
            title={v.title}
            desc={v.desc}
            delay={0.35 + i * 0.07}
          />
        ))}
      </motion.div>

      {/* CTA */}
      <SlideButton onClick={onNext} accent={accent} delay={0.58}>
        {groupName ? `Join ${groupName} →` : 'Get Started →'}
      </SlideButton>
    </div>
  );
}

/* ─── Screen 2 — Passport Connect ───────────────────────────── */
function Screen2({ onNext, accent }: { onNext: () => void; accent: string }) {
  const { isConnected, address } = useAccount();
  const { isAuthenticated, signIn, isLoading, error } = useSiweAuth();

  const handleSignIn = async () => {
    console.log('--- handleSignIn triggered ---');
    console.log('Current Screen2 address:', address);
    try {
      console.log('Attempting to signIn via useSiweAuth (v2)...');
      const token = await signIn();
      console.log('SignIn result token:', token);
    } catch (err) {
      console.error('SignIn error caught in handleSignIn:', err);
    }
  };

  const perms = [
    { text: 'Execute stakes on confirmed markets' },
    { text: 'Collect yield directly to your address' },
    { text: 'Never move your BTC principal' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px,4vw,34px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            marginBottom: 10,
          }}
        >
          Connect your Mezo Passport
        </h2>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Your Mezo Passport is a smart account — it lets Presight execute stakes on your behalf,{' '}
          <em>within the spending limit you set</em>. Nothing moves without your approval.
        </p>
      </motion.div>

      {/* Permission cards — Limoncello style */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', borderRadius: 16 }}
      >
        {perms.map((p, i) => (
          <LimonCard
            key={i}
            accent={accent}
            title={p.text}
            delay={0.22 + i * 0.07}
          />
        ))}
      </motion.div>

      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => {
          const ready = mounted;
          
          const handleButtonClick = () => {
            if (!ready) return;
            if (!isConnected) {
              openConnectModal();
            } else if (!isAuthenticated) {
              handleSignIn();
            } else {
              onNext();
            }
          };

          const getButtonLabel = () => {
            if (!ready) return 'Loading...';
            if (!isConnected) return 'Connect Mezo Passport →';
            if (isLoading) return 'Signing in...';
            if (!isAuthenticated) return 'Sign In to Presight →';
            return 'Continue →';
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SlideButton 
                onClick={handleButtonClick} 
                disabled={!ready || isLoading} 
                accent={accent} 
                delay={0.42}
              >
                {getButtonLabel()}
              </SlideButton>
              {error && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

/* ─── Screen 3 — MUSD Balance ────────────────────────────────── */
function Screen3({ onNext, accent }: { onNext: () => void; accent: string }) {
  const { address } = useAccount();
  const { token } = useSiweAuth();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    token: '0x507Ac33B7B1332b4488AE772fB116cb2E0EA0511', // mUSD Address on Mezo Testnet
  });

  const { data: troveData, isLoading: isTroveLoading } = useTrove(token);

  const musdBalance = balance ? parseFloat(formatUnits(balance.value, balance.decimals)) : 0;
  const btcCollateral = troveData ? parseFloat(troveData.troveBalance) : 0.5;
  const hasMusd = musdBalance > 0;

  const infoCards = [
    {
      title: 'BTC Collateral',
      desc: isTroveLoading ? 'Loading vault...' : `${btcCollateral.toFixed(2)} BTC locked in Mezo vault · ≈ $${(btcCollateral * 67000).toLocaleString()}`,
    },
    {
      title: isBalanceLoading ? 'Checking balance...' : hasMusd ? `${musdBalance.toFixed(2)} MUSD available` : 'You have 0 MUSD',
      desc: hasMusd
        ? "You're ready to stake in prediction markets."
        : 'Mint MUSD against your BTC collateral to join any market.',
    },
    {
      title: 'Mint MUSD',
      desc: `From your ${btcCollateral} BTC · instant, gasless`,
    },
  ];

  const handleAction = () => {
    if (!hasMusd && !isBalanceLoading) {
      window.open('https://mezo.org/borrow', '_blank');
    } else {
      onNext();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px,4vw,34px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            marginBottom: 10,
          }}
        >
          Your MUSD balance
        </h2>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          MUSD is the native stablecoin of Mezo, minted against your Bitcoin. It&apos;s what you
          stake in prediction markets.
        </p>
      </motion.div>

      {/* Info cards — Limoncello style */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', borderRadius: 16 }}
      >
        {infoCards.map((c, i) => (
          <LimonCard
            key={i}
            accent={accent}
            title={c.title}
            desc={c.desc}
            delay={0.22 + i * 0.07}
          />
        ))}
      </motion.div>

      <SlideButton onClick={handleAction} accent={accent} delay={0.48}>
        {isBalanceLoading ? 'Syncing...' : hasMusd ? 'Continue →' : 'Mint mUSD →'}
      </SlideButton>
    </div>
  );
}

/* ─── Screen 4 — Mandate / Spend limit ──────────────────────── */
function Screen4({ onNext, accent }: { onNext: () => void; accent: string }) {
  const [limit, setLimit] = useState(200);
  const MAX = 1000;

  const { token } = useSiweAuth();
  const { setMandate, getMandate } = useMandate(token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync existing mandate on mount
  useEffect(() => {
    if (token) {
      getMandate.execute().then(res => {
        if (res.data?.limitPerMarket) {
          const formatted = parseFloat(formatUnits(BigInt(res.data.limitPerMarket), 18));
          setLimit(Math.min(formatted, MAX));
        }
      });
    }
  }, [token]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const limitWei = parseEther(limit.toString()).toString();
      const result = await setMandate.execute({ limitPerMarket: limitWei });
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        onNext();
      }
    } catch (e) {
      setErrorMsg("Failed to approve mandate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { title: 'Gasless Staking', desc: 'Protocol covers your fees' },
    { title: 'One-Click UX', desc: 'No transaction prompts' },
    { title: 'Total Control', desc: 'Revoke limit anytime' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px,4vw,34px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            marginBottom: 10,
          }}
        >
          Set your spending limit
        </h2>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Like a credit card limit — Presight can only stake up to this amount on your behalf. You
          can change it anytime.
        </p>
      </motion.div>

      {/* Slider card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${accent}`,
          padding: '24px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Mandate limit</span>
          <motion.span
            key={limit}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: '#0a0a0a' }}
          >
            {limit} <span style={{ fontSize: 16, fontWeight: 600, color: '#888' }}>MUSD</span>
          </motion.span>
        </div>

        {/* Track */}
        <div style={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'absolute', width: '100%', height: 6, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
            <motion.div
              initial={false}
              animate={{ width: `${(limit / MAX) * 100}%` }}
              style={{ height: '100%', background: accent, borderRadius: 10 }}
            />
          </div>
          <input
            type="range"
            min={50}
            max={MAX}
            step={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              position: 'relative',
              width: '100%',
              height: 40,
              opacity: 0,
              cursor: 'pointer',
              zIndex: 10
            }}
          />
          {/* Custom Thumb */}
          <motion.div
            initial={false}
            animate={{ left: `calc(${(limit / MAX) * 100}% - 12px)` }}
            style={{
              position: 'absolute',
              width: 24,
              height: 24,
              background: 'white',
              border: `3px solid ${accent}`,
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              pointerEvents: 'none'
            }}
          />
        </div>
        {/* Presets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          {[100, 250, 500, 1000].map(val => (
            <button
              key={val}
              onClick={() => setLimit(val)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: limit === val ? accent : '#f8f8f8',
                color: limit === val ? 'white' : '#666',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ${val}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Benefits cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.6)',
              padding: '12px 8px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.04)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#333', marginBottom: 2 }}>{b.title}</div>
            <div style={{ fontSize: 10, color: '#888', lineHeight: 1.2 }}>{b.desc}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SlideButton 
          onClick={handleApprove} 
          disabled={isSubmitting} 
          accent={accent} 
          delay={0.55}
        >
          {isSubmitting ? 'Registering...' : getMandate.data ? 'Update Limit →' : 'Enable Magic Staking →'}
        </SlideButton>
        {errorMsg && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{errorMsg}</div>}
      </div>
    </div>
  );
}

/* ─── Screen 5 — Mode preference ────────────────────────────── */

function OnboardingModeCard({
  modeKey,
  title,
  price,
  priceStyle,
  suffix,
  buttonLabel,
  usageItems,
  featureItems,
  variant,
  isSelected,
  onClick,
}: {
  modeKey: string;
  title: string;
  price: string;
  priceStyle?: 'handwritten' | 'normal';
  suffix?: string;
  buttonLabel: string;
  usageItems: string[];
  featureItems: string[];
  variant: 'green' | 'pink';
  isSelected: boolean;
  onClick: () => void;
}) {
  const isGreen = variant === 'green';
  const accentColor = isGreen ? '#22c55e' : '#EF476F';
  const bgColor = isGreen ? '#e8ede4' : '#fde8ec';
  const gridColor = isGreen ? 'rgba(100,120,80,0.15)' : 'rgba(200,50,80,0.10)';

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, x: isGreen ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: bgColor,
        borderRadius: 18,
        position: 'relative',
        flex: 1,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: isSelected
          ? `0 0 0 3px ${accentColor}, 0 8px 32px rgba(0,0,0,0.1)`
          : '0 4px 24px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        gap: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`grid-price-select-${variant}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke={gridColor} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-price-select-${variant})`} />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${bgColor} 100%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: accentColor, opacity: 0.15 }} />
      </div>
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '24px 24px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          position: 'relative',
          zIndex: 10,
          textAlign: 'left'
        }}
      >
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          {isSelected && <span style={{ color: accentColor, fontSize: 16 }}>●</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', color: '#0a0a0a' }}>
            {price}
          </span>
          {priceStyle === 'handwritten' && (
            <span style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: 24, color: '#00C2A8', fontWeight: 700 }}>
              safe!
            </span>
          )}
          {suffix && <span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>{suffix}</span>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0a', marginBottom: 22, letterSpacing: '-0.02em' }}>
          {buttonLabel}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>Usage</div>
          {usageItems.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 13, color: '#444' }}>{item}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>Features</div>
          {featureItems.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 13, color: '#444' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


function Screen5({ onDone, accent, onModeChange }: { onDone: () => void; accent: string; onModeChange: (mode: Mode) => void }) {
  const [mode, setMode] = useState<Mode>(null);
  const handleSetMode = (m: Mode) => { setMode(m); onModeChange(m); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <h2 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#0a0a0a', marginBottom: 10 }}>
          How do you want to play?
        </h2>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Pick your default staking mode. You can always switch per-market.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, position: 'relative' }}
      >
        <OnboardingModeCard
          modeKey="zero-risk"
          title="Mode 1"
          price="Zero Risk"
          priceStyle="handwritten"
          buttonLabel="Stake Yield"
          usageItems={['Principal never at risk']}
          featureItems={['Earn from Mezo Testnet', 'Auto-accrues every block', 'Back markets risk-free']}
          variant="green"
          isSelected={mode === 'zero-risk'}
          onClick={() => handleSetMode('zero-risk')}
        />
        <OnboardingModeCard
          modeKey="full-stake"
          title="Mode 2"
          price="Full Stake"
          buttonLabel="Stake MUSD"
          usageItems={['High conviction staking', 'Share in the NO/YES pool']}
          featureItems={['No gas fees with Passport', 'Straight to your wallet on win']}
          variant="pink"
          isSelected={mode === 'full-stake'}
          onClick={() => handleSetMode('full-stake')}
        />


      </motion.div>

      {/* CTA */}
      <SlideButton
        onClick={mode ? onDone : undefined}
        disabled={!mode}
        accent={mode === 'zero-risk' ? '#22c55e' : mode === 'full-stake' ? '#EF476F' : accent}
        delay={0.4}
      >
        {mode
          ? `Start with ${mode === 'zero-risk' ? 'Zero Risk' : 'Full Stake'} →`
          : 'Choose a mode to continue'}
      </SlideButton>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [continueSignal, setContinueSignal] = useState(0);
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviter = searchParams.get('inviter');
  const groupName = searchParams.get('group');

  const TOTAL = 5;

  const accent = SCREEN_COLORS[step];
  // On last step, board color reacts to the selected mode
  const boardAccent =
    step === 4 && selectedMode === 'zero-risk'
      ? '#22c55e'
      : step === 4 && selectedMode === 'full-stake'
        ? '#EF476F'
        : accent;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    if (next > step) setContinueSignal(s => s + 1); // trigger bg speed boost
  };

  const handleDone = () => {
    router.push('/app/dashboard');
  };

  const screens = [
    <Screen1 key="s1" onNext={() => go(1)} accent={SCREEN_COLORS[0]} inviter={inviter} groupName={groupName} />,
    <Screen2 key="s2" onNext={() => go(2)} accent={SCREEN_COLORS[1]} />,
    <Screen3 key="s3" onNext={() => go(3)} accent={SCREEN_COLORS[2]} />,
    <Screen4 key="s4" onNext={() => go(4)} accent={SCREEN_COLORS[3]} />,
    <Screen5 key="s5" onDone={handleDone} accent={SCREEN_COLORS[4]} onModeChange={setSelectedMode} />,
  ];

  return (
    <>
      {/* Floating tags ALWAYS behind everything — rendered outside any stacking context */}
      <FloatingTagsBackground continueSignal={continueSignal} />

      <div
        style={{
          minHeight: '100svh',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          fontFamily: 'var(--font-inter), -apple-system, sans-serif',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: step === 4 ? 1040 : 660, transition: 'max-width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
          {/* Top nav — back button + step dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            {/* Back button (left) */}
            {step > 0 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, borderColor: `${boardAccent}55` }}
                onClick={() => go(step - 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `1px solid ${boardAccent}55`,
                  borderRadius: 100,
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#333',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  letterSpacing: '-0.01em',
                }}
              >
                ← Back
              </motion.button>
            ) : (
              <div style={{ width: 80 }} />
            )}

            {/* Step dots (center) */}
            <StepDots current={step} total={TOTAL} accent={boardAccent} />

            {/* Step label (right) */}
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 12,
                color: '#999',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                minWidth: 80,
                textAlign: 'right',
              }}
            >
              {step + 1} / {TOTAL}
            </motion.div>
          </div>

          {/* Card container — Map Layout */}
          <motion.div
            style={{
              borderRadius: 24,
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 'clamp(16px, 3vw, 24px)',
              paddingBottom: '20px',
              gap: 16,
            }}
          >
            {/* Animated Background layer */}
            <motion.div
              animate={{ backgroundColor: boardAccent }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Map grid lines */}
            <motion.svg
              width="100%" height="100%"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3 }}
              animate={{ color: boardAccent }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <defs>
                <pattern id="grid-onboarding" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-onboarding)" />
            </motion.svg>

            {/* Inner White Card Content */}
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 'clamp(20px,5vw,36px)',
                width: '100%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                position: 'relative',
                zIndex: 10,
              }}
            >
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {screens[step]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
