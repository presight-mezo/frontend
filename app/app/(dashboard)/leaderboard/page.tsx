'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  address: string;
  avatar: string;
  convictionScore: number;
  winRate: number;
  totalCalls: number;
  wins: number;
  isCurrentUser?: boolean;
}

// ─── Score Bands ──────────────────────────────────────────────────────────────

const SCORE_BANDS = [
  { label: 'Beginner',   min: 0,    max: 200,     icon: '🌱', range: '0 – 200',     accent: '#71717a', bg: 'bg-zinc-100/80',   border: 'border-zinc-200/50',   badgeBg: 'bg-zinc-100',   badgeText: 'text-zinc-500' },
  { label: 'Developing', min: 200,  max: 500,     icon: '📈', range: '200 – 500',   accent: '#3b82f6', bg: 'bg-blue-100/80',   border: 'border-blue-200/50',   badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700' },
  { label: 'Confident',  min: 500,  max: 800,     icon: '🎯', range: '500 – 800',   accent: '#a855f7', bg: 'bg-purple-100/80', border: 'border-purple-200/50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
  { label: 'Sharp',      min: 800,  max: 1200,    icon: '⚡', range: '800 – 1,200', accent: '#f97316', bg: 'bg-orange-100/80', border: 'border-orange-200/50', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  { label: 'Oracle',     min: 1200, max: Infinity, icon: '🔮', range: '1,200+',      accent: '#00C2A8', bg: 'bg-teal-100/80',   border: 'border-teal-200/50',   badgeBg: 'bg-teal-100',   badgeText: 'text-teal-700' },
];

function getBand(score: number) {
  return SCORE_BANDS.find(b => score >= b.min && score < b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

// ─── Hardcoded Data ───────────────────────────────────────────────────────────

const DATA: LeaderboardEntry[] = [
  { rank: 1,  address: '0xA1b2C3d4E5f6A1b2C3d4E5f6A1b2C3d4E5f6A1b2', avatar: '🦅', convictionScore: 1487, winRate: 82, totalCalls: 34, wins: 28 },
  { rank: 2,  address: '0xDeAd8f9e1A2B3c4D5E6F7A8B9c0d1E2F3A4B5c6D', avatar: '🐉', convictionScore: 1312, winRate: 76, totalCalls: 41, wins: 31 },
  { rank: 3,  address: '0x9876FEdcBA9876FEdcBA9876FEdcBA9876FEdcBA', avatar: '🦁', convictionScore: 1105, winRate: 70, totalCalls: 27, wins: 19 },
  { rank: 4,  address: '0xCaFeBaBe0000111122223333444455556666CAFE', avatar: '🦊', convictionScore: 943,  winRate: 65, totalCalls: 52, wins: 34 },
  { rank: 5,  address: '0x1337c0DeDEADF00DCAFEBABE0000BEEFCACE1337', avatar: '🐺', convictionScore: 821,  winRate: 61, totalCalls: 18, wins: 11 },
  { rank: 6,  address: '0xF00DB00B5CA1AB1E5EED1234567890ABCDEF0001', avatar: '🦋', convictionScore: 674,  winRate: 58, totalCalls: 24, wins: 14 },
  { rank: 7,  address: '0xBEEFA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8', avatar: '🐋', convictionScore: 540,  winRate: 54, totalCalls: 13, wins: 7  },
  { rank: 8,  address: '0x0011223344556677889900AABBCCDDEEFF001122', avatar: '🦚', convictionScore: 398,  winRate: 48, totalCalls: 29, wins: 14 },
  { rank: 9,  address: '0xAAAABBBBCCCCDDDDEEEEFFFF00001111AAAABBBB', avatar: '🐸', convictionScore: 245,  winRate: 44, totalCalls: 9,  wins: 4  },
  { rank: 12, address: '0x0000000000000000000000000000000000001234', avatar: '😎', convictionScore: 167,  winRate: 40, totalCalls: 5,  wins: 2,  isCurrentUser: true },
];

function fmt(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

// ─── Animation Variants ───────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -22 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

// ─── Scroll Reveal ────────────────────────────────────────────────────────────

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  const me = DATA.find(e => e.isCurrentUser)!;
  const meBand = getBand(me.convictionScore);
  const rows = showAll ? DATA : DATA.slice(0, 5);

  return (
    <div className="relative font-sans bg-transparent min-h-screen">
      <motion.section
        className="relative z-10 p-4 md:p-8 max-w-3xl mx-auto py-10 space-y-10"
        initial="hidden"
        animate="show"
        variants={stagger}
      >

        {/* ── Hero Header ──────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <span className="text-[10px] text-blue-500">●</span>
            Conviction Leaderboard
          </div>
          <h1 className="text-[clamp(36px,6vw,60px)] font-bold tracking-tight leading-[1.04] text-gray-900 max-w-md">
            Rank by conviction,<br />not by luck.
          </h1>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-md">
            Scores reset only on{' '}
            <code className="text-[11px] bg-black/5 px-1.5 py-0.5 rounded-md font-mono">market:resolved</code>
            {' '}— a correct big bet beats a dozen small hedges.
          </p>
        </motion.div>

        {/* ── Your Standing + Score Bands ──────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

          {/* Your standing – dark card */}
          <div className="rounded-[18px] p-8 relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(160deg, #0c1e3d 0%, #0a0a0a 55%, #1a1a2e 100%)' }}>
            {/* Colored top strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${meBand.accent}, ${meBand.accent}99)` }} />
            {/* Twinkling stars */}
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.28 }}
                className="absolute rounded-full bg-white pointer-events-none"
                style={{
                  width: i % 4 === 0 ? 3 : 2,
                  height: i % 4 === 0 ? 3 : 2,
                  top: `${8 + (i * 67 + 13) % 84}%`,
                  left: `${4 + (i * 53 + 17) % 90}%`,
                }}
              />
            ))}
            <div className="relative z-10 space-y-5">
              <div className="text-[10px] text-white/40 font-bold tracking-[0.14em] uppercase">Your Standing</div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/8 flex items-center justify-center text-[22px] border border-white/10">
                  {me.avatar}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white/75 font-mono">{fmt(me.address)}</div>
                  <div className="text-[10px] text-white/30 font-bold tracking-[0.1em]">RANK #{me.rank}</div>
                </div>
              </div>
              <div>
                <div className="text-[52px] font-bold tracking-tight text-white leading-none mb-1">{me.convictionScore}</div>
                <div className="text-[10px] text-white/35 font-bold tracking-[0.12em] uppercase mb-4">Conviction Score</div>
                <div className="bg-white/8 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meBand.accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((me.convictionScore / 1600) * 100, 100)}%` }}
                    transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-white/25 font-bold">
                  <span>0</span>
                  <span style={{ color: meBand.accent }}>{meBand.icon} {meBand.label}</span>
                  <span>1,600</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Bands */}
          <div className="glass-card p-7 space-y-3">
            <div className="text-[10px] text-gray-400 font-bold tracking-[0.1em] uppercase">Score Bands</div>
            <div className="space-y-2.5">
              {SCORE_BANDS.map(b => {
                const isMe = me.convictionScore >= b.min && me.convictionScore < b.max;
                return (
                  <motion.div
                    key={b.label}
                    whileHover={{ x: 2 }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${b.bg} ${b.border}`}
                  >
                    <span className="text-base">{b.icon}</span>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold text-gray-900">{b.label}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{b.range}</div>
                    </div>
                    {isMe && (
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${b.badgeBg} ${b.badgeText} ${b.border}`}>
                        YOU
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── How It's Calculated ───────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setFormulaOpen(!formulaOpen)}
              className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-blue-500">●</span>
                <span className="text-[13px] font-bold text-gray-900 tracking-tight">How Conviction Score is calculated</span>
              </div>
              <motion.span
                animate={{ rotate: formulaOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-lg text-gray-300"
              >⌃</motion.span>
            </button>

            <AnimatePresence>
              {formulaOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-6 pb-7 space-y-5 border-t border-black/5">
                    {/* Formula block */}
                    <div className="mt-5 rounded-xl p-5 bg-[#0a0a0a] font-mono">
                      <div className="text-[10px] text-[#00C2A8] font-bold mb-3 tracking-wide">// On every market:resolved event</div>
                      <div className="text-[13px] leading-loose">
                        <span className="text-blue-400">stakeWeight</span>
                        <span className="text-zinc-600"> = </span>
                        <span className="text-zinc-100">userStake</span>
                        <span className="text-zinc-600"> / </span>
                        <span className="text-zinc-100">totalPool</span>
                        <span className="text-zinc-600">  &nbsp;// 0 → 1</span>
                        <br />
                        <span className="text-blue-400">scoreDelta</span>
                        <span className="text-zinc-600"> = </span>
                        <span className="text-yellow-300">isWinner</span>
                        <span className="text-zinc-600"> ? </span>
                        <span className="text-zinc-100">round(stakeWeight × 1000)</span>
                        <span className="text-zinc-600"> : </span>
                        <span className="text-zinc-100">0</span>
                      </div>
                    </div>
                    {/* Three pillars */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: '🎲', title: 'No Hedging Reward', body: 'Splitting both sides gives near-zero weight — "technically correct" earns almost nothing.' },
                        { icon: '⚖️', title: 'Ratio, Not Volume', body: '1,000 MUSD in 10k pool = same weight as 10 MUSD in 100 MUSD pool.' },
                        { icon: '🎯', title: 'Accuracy Only', body: 'Losses contribute 0. High activity without accuracy drags rank over time.' },
                      ].map(p => (
                        <motion.div
                          key={p.title}
                          whileHover={{ y: -2 }}
                          className="rounded-xl p-3.5 bg-white/60 border border-white/80"
                        >
                          <div className="text-[18px] mb-2">{p.icon}</div>
                          <div className="text-[12px] font-bold text-gray-900 mb-1">{p.title}</div>
                          <div className="text-[11px] text-gray-500 leading-relaxed">{p.body}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* ── Leaderboard Table ─────────────────────────────────────── */}
        <ScrollReveal delay={0.08}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <h2 className="text-[22px] font-bold tracking-tight text-gray-900">Top Predictors</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] bg-white/70 border border-white/80 rounded-full px-3 py-1">
                {DATA.length} Members
              </span>
            </div>

            {/* Header row */}
            <div className="glass-card px-5 py-3 grid gap-2"
              style={{ gridTemplateColumns: '44px 44px 1fr 80px 80px 100px' }}>
              {['', '', 'PREDICTOR', 'WIN RATE', 'W / TOTAL', 'SCORE'].map((h, i) => (
                <div key={i} className={`text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] ${i >= 3 ? 'text-center' : 'text-left'}`}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.map((entry, idx) => {
                const band = getBand(entry.convictionScore);
                const pct = Math.min((entry.convictionScore / 1600) * 100, 100);
                const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

                if (entry.isCurrentUser) {
                  return (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.46, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                      className="rounded-[14px] px-5 py-3.5 grid gap-2 items-center relative overflow-hidden shadow-lg"
                      style={{
                        gridTemplateColumns: '44px 44px 1fr 80px 80px 100px',
                        background: 'linear-gradient(160deg, #0c1e3d 0%, #0a0a0a 55%, #1a1a2e 100%)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, ${band.accent}, transparent)` }} />
                      {/* Rank */}
                      <div className="text-center">
                        <span className="text-[12px] font-bold text-white/30">#{entry.rank}</span>
                      </div>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-[18px] border border-white/10">
                        {entry.avatar}
                      </div>
                      {/* Name + bar */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[12px] font-bold text-white/80 font-mono">{fmt(entry.address)}</span>
                          <span className="text-[8px] font-bold tracking-wider text-[#00C2A8] bg-[#00C2A8]/12 border border-[#00C2A8]/20 rounded-full px-1.5 py-0.5">YOU</span>
                        </div>
                        <div className="h-[3px] bg-white/8 rounded-full overflow-hidden max-w-[160px]">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: band.accent }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 + idx * 0.05 }}
                          />
                        </div>
                      </div>
                      {/* Win rate */}
                      <div className="text-center">
                        <div className="text-[18px] font-bold tracking-tight text-white">{entry.winRate}%</div>
                        <div className="text-[9px] font-bold text-white/30 tracking-wider">WIN RATE</div>
                      </div>
                      {/* W / Total */}
                      <div className="text-center">
                        <div className="text-[14px] font-bold text-white/80">{entry.wins}/{entry.totalCalls}</div>
                        <div className="text-[9px] font-bold text-white/30 tracking-wider">W / TOTAL</div>
                      </div>
                      {/* Score */}
                      <div className="text-center">
                        <div className="text-[22px] font-bold tracking-tight text-white">{entry.convictionScore.toLocaleString()}</div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${band.badgeBg} ${band.badgeText} ${band.border}`}>
                          {band.icon} {band.label.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.46, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                    className="glass-card px-5 py-3.5 grid gap-2 items-center"
                    style={{ gridTemplateColumns: '44px 44px 1fr 80px 80px 100px' }}
                  >
                    {/* Rank */}
                    <div className="text-center">
                      {medal
                        ? <span className="text-[22px]">{medal}</span>
                        : <span className="text-[12px] font-bold text-gray-300">#{entry.rank}</span>
                      }
                    </div>
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-[18px]"
                      style={{ border: entry.rank <= 3 ? `2px solid ${entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#9ca3af' : '#fb923c'}` : '1px solid rgba(255,255,255,0.8)' }}
                    >
                      {entry.avatar}
                    </div>
                    {/* Name + bar */}
                    <div>
                      <div className="text-[12px] font-bold text-gray-900 font-mono mb-1.5">{fmt(entry.address)}</div>
                      <div className="h-[3px] bg-black/5 rounded-full overflow-hidden max-w-[160px]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: band.accent }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 + idx * 0.05 }}
                        />
                      </div>
                    </div>
                    {/* Win rate */}
                    <div className="text-center">
                      <div className="text-[18px] font-bold tracking-tight text-gray-900">{entry.winRate}%</div>
                      <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Win Rate</div>
                    </div>
                    {/* W / Total */}
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-gray-700">{entry.wins}/{entry.totalCalls}</div>
                      <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">W / Total</div>
                    </div>
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-[22px] font-bold tracking-tight text-gray-900">{entry.convictionScore.toLocaleString()}</div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${band.badgeBg} ${band.badgeText} ${band.border}`}>
                        {band.icon} {band.label.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show more / less */}
            {DATA.length > 5 && (
              <div className="text-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAll(!showAll)}
                  className="relative overflow-hidden inline-flex items-center gap-2 bg-white/60 border border-white/80 rounded-full px-5 py-2.5 text-[12px] font-bold text-gray-700 shadow-sm cursor-pointer group"
                >
                  <span className="absolute inset-0 bg-gray-900 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none" />
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                    {showAll ? '↑ Show Less' : `↓ Show All ${DATA.length} Members`}
                  </span>
                </motion.button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ── What Score Doesn't Reward — dark CTA strip ───────────── */}
        <ScrollReveal delay={0.1}>
          <div className="rounded-[24px] p-10 md:p-14 relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(160deg, #0c1e3d 0%, #0a0a0a 50%, #1a1a2e 100%)' }}>
            {/* Colored top strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, #00C2A8, #3b82f6)' }} />
            {/* Stars */}
            {Array.from({ length: 22 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                className="absolute rounded-full bg-white pointer-events-none"
                style={{
                  width: i % 5 === 0 ? 3 : 2,
                  height: i % 5 === 0 ? 3 : 2,
                  top: `${10 + (i * 73 + 31) % 80}%`,
                  left: `${5 + (i * 47 + 19) % 90}%`,
                }}
              />
            ))}

            <div className="relative z-10 space-y-8">
              <div>
                <div className="text-[10px] text-white/35 font-bold tracking-[0.12em] uppercase mb-4">Design Intent</div>
                <h2 className="text-[clamp(26px,4vw,42px)] font-bold tracking-tight leading-[1.05] text-white">
                  What the score<br />doesn&apos;t reward
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                {[
                  { icon: '🎲', title: 'Random Hedging', body: 'Spreading small stakes across both sides gives near-zero weight per stake — so even "correct" bets earn tiny deltas.' },
                  { icon: '💰', title: 'Pure Volume',    body: '1,000 MUSD in a 10,000 MUSD pool = same stake weight as 10 MUSD in a 100 MUSD pool. Size without conviction is worthless.' },
                  { icon: '📋', title: 'Participation',  body: 'Losing calls contribute zero. High activity without accuracy drags your relative ranking down over time.' },
                ].map(item => (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
                    className="bg-white/5 border border-white/8 rounded-[16px] p-5 transition-shadow"
                  >
                    <div className="text-[24px] mb-2.5">{item.icon}</div>
                    <div className="text-[13px] font-bold text-white mb-1.5">{item.title}</div>
                    <div className="text-[12px] text-white/50 leading-relaxed">{item.body}</div>
                  </motion.div>
                ))}
              </div>

              {/* Zero Risk note */}
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-start gap-4 bg-[#00C2A8]/8 border border-[#00C2A8]/20 rounded-[14px] p-4"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#00C2A8]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🛡️</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#00C2A8] mb-1">Zero Risk Mode &amp; the Score</div>
                  <div className="text-[12px] text-white/50 leading-relaxed max-w-lg">
                    Zero Risk stakes count identically — but the staked amount is your accrued yield, which tends to be smaller. Zero Risk players naturally accumulate score more slowly than Full Stake players. This is by design: the score reflects conviction, and staking yield carries less conviction than staking principal.
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>

      </motion.section>
    </div>
  );
}
