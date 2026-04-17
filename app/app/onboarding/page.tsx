'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePresightApi } from '@/lib/ApiProvider';
import { useMandate, useTrove, useProfile, useGroups } from '@/hooks/useApi';
import { parseEther, formatUnits } from 'viem';
import {
  Users,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Activity,
  CircleCheckBig,
  Smartphone
} from 'lucide-react';

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

      {/* Value props — Unique Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="col-span-1 md:col-span-2 p-8 rounded-3xl border border-black/5 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
          style={{ background: `${accent}15` }}
        >
          <div className="relative z-10 w-fit p-4 rounded-2xl bg-white shadow-sm mb-4">
            <Users size={32} strokeWidth={1.5} style={{ color: accent }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">Social-first markets</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[280px]">Predict alongside your circle, not faceless strangers. Private groups, shared conviction.</p>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Users size={180} strokeWidth={1} />
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex-1 p-6 rounded-3xl border border-black/5 bg-[#f8f8f7] flex flex-col gap-3 group hover:border-[#0a0a0a]/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={20} className="text-gray-400 group-hover:text-black transition-colors" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-1">Safe Principal</h4>
              <p className="text-xs text-gray-500 leading-normal">Your BTC stays safe. Interest plays.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42, duration: 0.5 }}
            className="flex-1 p-6 rounded-3xl border border-black/5 bg-[#f8f8f7] flex flex-col gap-3 group hover:border-[#0a0a0a]/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Zap size={20} className="text-gray-400 group-hover:text-black transition-colors" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-1">Gasless</h4>
              <p className="text-xs text-gray-500 leading-normal">Mezo Passport magic. Zero gas.</p>
            </div>
          </motion.div>
        </div>
      </div>

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
  const { isAuthenticated, signIn, isLoading, error } = usePresightApi();

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

      {/* Passport Visual Card */}
      <motion.div
        initial={{ rotateY: -10, rotateX: 5, opacity: 0 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8 }}
        className="relative w-full aspect-[1.6/1] rounded-[24px] p-8 overflow-hidden shadow-2xl mx-auto mb-4 border border-white/20 perspective-1000"
        style={{
          background: `linear-gradient(135deg, ${accent}dd 0%, ${accent} 100%)`,
        }}
      >
        {/* Decorative patterns */}
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Smartphone size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between text-black">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Mezo Network</div>
              <div className="text-xl font-black tracking-tighter">Digital Passport</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone size={24} />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Account Address</div>
            <div className="font-mono text-sm tracking-widest bg-black/5 px-4 py-2.5 rounded-xl truncate border border-black/5">
              {address || '0x0000...0000'}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-black animate-pulse' : 'bg-black/20'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                {isAuthenticated ? 'Status: Authenticated' : 'Status: Pending Connection'}
              </span>
            </div>
            {isAuthenticated && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: -12 }}
                className="bg-white/40 backdrop-blur-md border border-white/40 px-5 py-2.5 rounded-2xl shadow-lg"
              >
                <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">Verified</div>
                <div className="text-xs font-black">Smart Account</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Permissions Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {perms.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-4 rounded-2xl border border-black/5 bg-[#f8f8f7] flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">
              {i === 0 ? <Activity size={16} style={{ color: accent }} /> :
                i === 1 ? <TrendingUp size={16} style={{ color: accent }} /> :
                  <Lock size={16} style={{ color: accent }} />}
            </div>
            <span className="text-xs font-bold text-gray-700 leading-tight">{p.text}</span>
          </motion.div>
        ))}
      </div>

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
  const { token } = usePresightApi();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    token: '0x507Ac33B7B1332b4488AE772fB116cb2E0EA0511' as `0x${string}`,
  });

  const { data: troveData, isLoading: isTroveLoading } = useTrove(token) as any;

  const musdBalance = balance ? parseFloat(formatUnits(balance.value, balance.decimals)) : 0;
  const btcCollateral = troveData ? parseFloat(troveData.troveBalance as string) : 0.5;
  const hasMusd = musdBalance > 0;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BTC Collateral Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative overflow-hidden rounded-[24px] border border-black/[0.03] shadow-lg group p-6 min-h-[160px] flex flex-col justify-between"
          style={{ background: `linear-gradient(135deg, #F7931A 0%, #FFAB40 100%)` }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={80} strokeWidth={1} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Wallet size={20} className="text-black" />
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40">BTC Collateral</div>
              <div className="text-2xl font-black tracking-tighter text-black">
                {isTroveLoading ? '---' : btcCollateral.toFixed(2)} <span className="text-sm opacity-60">BTC</span>
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Mezo Vault Position</h4>
            <p className="text-[10px] font-bold opacity-40">≈ ${(btcCollateral * 67000).toLocaleString()}</p>
          </div>
        </motion.div>

        {/* MUSD Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-[24px] border border-black/[0.03] shadow-lg group p-6 min-h-[160px] flex flex-col justify-between"
          style={{ background: `linear-gradient(135deg, #00C2A8 0%, #40E0D0 100%)` }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={80} strokeWidth={1} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Activity size={20} className="text-black" />
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40">MUSD Balance</div>
              <div className="text-2xl font-black tracking-tighter text-black">
                {isBalanceLoading ? '---' : musdBalance.toFixed(2)} <span className="text-sm opacity-60">MUSD</span>
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Prediction Liquidity</h4>
            <p className="text-[10px] font-bold opacity-40">Available to stake</p>
          </div>
        </motion.div>
      </div>

      {/* Mint Hint Card */}
      {!hasMusd && !isBalanceLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl border border-black/5 bg-[#f8f8f7] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <ArrowUpRight size={16} className="text-mezo-teal" />
            </div>
            <div>
              <div className="text-xs font-bold text-black">Need MUSD?</div>
              <div className="text-[10px] text-gray-500">Mint against your {btcCollateral} BTC BTC collateral.</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('https://mezo.org/borrow', '_blank')}
            className="px-3 py-1.5 bg-white border border-black/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-black shadow-sm"
          >
            Mint →
          </motion.button>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <SlideButton onClick={handleAction} accent={accent} delay={0.48}>
          {isBalanceLoading ? 'Syncing...' : hasMusd ? 'Continue →' : 'Mint mUSD →'}
        </SlideButton>

        {!hasMusd && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onNext}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors text-center"
          >
            Skip for now →
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ─── Screen 4 — Mandate / Spend limit ──────────────────────── */
function Screen4({ onNext, accent }: { onNext: () => void; accent: string }) {
  const [limit, setLimit] = useState(200);
  const MAX = 1000;

  const { token } = usePresightApi();
  const { setMandate, getMandate } = useMandate(token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync existing mandate on mount
  useEffect(() => {
    if (token) {
      getMandate.execute().then((res: any) => {
        if (res.data?.limitPerMarket) {
          const formatted = parseFloat(formatUnits(BigInt(res.data.limitPerMarket), 18));
          setLimit(Math.min(formatted, MAX));
        }
      });
    }
  }, [token, getMandate]);

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
    } catch {
      setErrorMsg("Failed to approve mandate");
    } finally {
      setIsSubmitting(false);
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
          Set your spending limit
        </h2>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Like a credit card limit — Presight can only stake up to this amount on your behalf. You
          can change it anytime.
        </p>
      </motion.div>

      <div className="relative flex flex-col items-center">
        {/* Mandate Hub Visualization */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/40 border border-black/[0.03] rounded-[32px] p-8 backdrop-blur-md shadow-sm relative overflow-hidden">

          {/* Decorative Topographic Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 400 400">
              <path d="M0 100 Q 100 50 200 100 T 400 100" fill="none" stroke={accent} strokeWidth="2" />
              <path d="M0 150 Q 80 120 180 160 T 400 150" fill="none" stroke={accent} strokeWidth="2" />
              <path d="M0 200 Q 120 180 220 220 T 400 200" fill="none" stroke={accent} strokeWidth="2" />
            </svg>
          </div>

          {/* Left Side: Radial Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative py-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Background Arc */}
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-[220deg]">
                <circle
                  cx="100" cy="100" r="80" fill="transparent"
                  stroke={`${accent}15`} strokeWidth="12"
                  strokeDasharray="375 502" strokeLinecap="round"
                />
                {/* Active Arc */}
                <motion.circle
                  cx="100" cy="100" r="80" fill="transparent"
                  stroke={accent} strokeWidth="12" strokeLinecap="round"
                  initial={false}
                  animate={{ strokeDasharray: `${(limit / MAX) * 375} 502` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
              </svg>

              {/* Central Value Display */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <motion.div key={limit} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-4xl font-black text-black tracking-tighter">
                  {limit}
                </motion.div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">MUSD</div>
              </div>

              {/* HUD Elements */}
              <div className="absolute -top-2 -right-2">
                <div className={`w-3 h-3 rounded-full ${limit > 0 ? 'bg-green-500' : 'bg-gray-300'} animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
              </div>
            </div>

            <div className="mt-4 px-4 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.05] text-[9px] font-black uppercase tracking-widest text-gray-500">
              Protocol Limit Status: <span className={limit > 0 ? "text-green-600" : ""}>{limit > 0 ? 'ACTIVE' : 'PENDING'}</span>
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="md:col-span-7 flex flex-col gap-6 relative z-10">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Configuration</div>
              <div className="text-xl font-black tracking-tight text-black uppercase">Spending Mandate</div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 max-w-[280px]">Set the maximum MUSD Presight can stake for you per market. Change this safely anytime.</p>
            </div>

            <div className="space-y-4">
              {/* Tactical Slider */}
              <div className="relative h-10 flex items-center group">
                <div className="absolute w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${(limit / MAX) * 100}%` }}
                    className="h-full"
                    style={{ backgroundColor: accent }}
                  />
                </div>
                <input
                  type="range"
                  min={50}
                  max={MAX}
                  step={50}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div
                  initial={false}
                  animate={{ left: `calc(${(limit / MAX) * 100}% - 12px)` }}
                  className="absolute w-6 h-6 bg-white rounded-full shadow-md pointer-events-none flex items-center justify-center border-2"
                  style={{ borderColor: accent }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                </motion.div>
              </div>

              {/* Preset Grid */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => setLimit(val)}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${limit === val
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white text-gray-400 border border-black/5 hover:border-black/10'
                      }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-12 mt-4">
        <SlideButton
          onClick={handleApprove}
          disabled={isSubmitting}
          accent={accent}
          delay={0.55}
        >
          {isSubmitting ? 'Registering...' : getMandate.data ? 'Update Limit →' : 'Enable Magic Staking →'}
        </SlideButton>
        {errorMsg && <div className="text-red-500 text-xs text-center font-bold">{errorMsg}</div>}
      </div>
    </div>
  );
}

/* ─── Screen 5 — Mode preference ────────────────────────────── */

function OnboardingModeCard({
  title,
  price,
  priceStyle,
  variant,
  isSelected,
  onClick,
  usageItems,
  featureItems,
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
  const bgColor = isGreen ? '#f0fdf4' : '#fff1f2';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex-1 p-8 rounded-[32px] border-2 transition-all cursor-pointer overflow-hidden ${isSelected ? 'shadow-2xl' : 'shadow-sm'
        }`}
      style={{
        backgroundColor: isSelected ? 'white' : bgColor,
        borderColor: isSelected ? accentColor : 'transparent',
      }}
    >
      {/* Background Icon Watermark */}
      <div className="absolute -right-4 -top-4 opacity-[0.03] text-black">
        {isGreen ? <ShieldCheck size={160} /> : <TrendingUp size={160} />}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-gray-50' : 'bg-white'}`}>
            {isGreen ? <ShieldCheck size={24} style={{ color: accentColor }} /> : <TrendingUp size={24} style={{ color: accentColor }} />}
          </div>
          {isSelected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[9px] font-black uppercase tracking-widest text-white">
              <CircleCheckBig size={10} /> Selected
            </motion.div>
          )}
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tighter text-black uppercase">{price}</h3>
            {priceStyle === 'handwritten' && (
              <span className="text-xs font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-md uppercase tracking-widest">Safe</span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3 ml-1">Usage</div>
            <div className="space-y-3">
              {usageItems.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-xs font-bold text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3">Key Features</div>
            <div className="space-y-2.5">
              {featureItems.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="mt-1">
                    <CircleCheckBig size={12} style={{ color: accentColor }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
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
  const groupId = searchParams.get('groupId');

  const TOTAL = 5;

  const accent = SCREEN_COLORS[step];
  // On last step, board color reacts to the selected mode
  const boardAccent =
    step === 4 && selectedMode === 'zero-risk'
      ? '#22c55e'
      : step === 4 && selectedMode === 'full-stake'
        ? '#EF476F'
        : accent;

  const { token } = usePresightApi();
  const { onboardProfile } = useProfile(token || undefined);
  const { joinGroup } = useGroups(token || undefined);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    if (next > step) setContinueSignal(s => s + 1); // trigger bg speed boost
  };

  const handleDone = async () => {
    if (selectedMode) {
      await onboardProfile.execute({ defaultRiskMode: selectedMode as 'zero-risk' | 'full-stake' });
    }

    if (groupId) {
      console.log('[Onboarding] Joining group:', groupId);
      await joinGroup.execute(groupId);
      router.push(`/app/groups/${groupId}`);
    } else {
      router.push('/app/dashboard');
    }
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
              borderRadius: 32,
              position: 'relative',
              backgroundColor: 'white',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 12px 64px rgba(0,0,0,0.08), 0 2px 16px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 'clamp(16px, 3vw, 24px)',
              paddingBottom: '24px',
              gap: 16,
            }}
          >
            {/* Animated Background layer */}
            <motion.div
              animate={{ backgroundColor: boardAccent }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Map grid lines */}
            <motion.svg
              width="100%" height="100%"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.2 }}
              animate={{ color: boardAccent }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <defs>
                <pattern id="grid-onboarding" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-onboarding)" />
            </motion.svg>

            {/* Inner Content Section */}
            <div
              style={{
                background: 'transparent',
                width: '100%',
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
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
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
