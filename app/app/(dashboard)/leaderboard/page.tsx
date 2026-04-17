'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, TrendingUp, Target, Zap, Sparkles, Dices, Scale, Ban, Coins, ClipboardList, Loader2, Award } from 'lucide-react';
import { usePresightApi } from '@/lib/ApiProvider';
import { useProfile } from '@/hooks/useApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  address: string;
  convictionScore: number;
  winRate: number;
  totalCalls: number;
  marketsPlayed: number;
  wins: number;
}

// ─── Score Bands ──────────────────────────────────────────────────────────────

export const SCORE_BANDS = [
  { label: 'Beginner',   min: 0,    max: 200,     icon: Sprout,     range: '0 – 200',     accent: '#71717a', bg: 'bg-zinc-100/80',   border: 'border-zinc-200/50',   badgeBg: 'bg-zinc-100',   badgeText: 'text-zinc-500' },
  { label: 'Developing', min: 200,  max: 500,     icon: TrendingUp, range: '200 – 500',   accent: '#3b82f6', bg: 'bg-blue-100/80',   border: 'border-blue-200/50',   badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700' },
  { label: 'Confident',  min: 500,  max: 800,     icon: Target,     range: '500 – 800',   accent: '#a855f7', bg: 'bg-purple-100/80', border: 'border-purple-200/50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
  { label: 'Sharp',      min: 800,  max: 1200,    icon: Zap,        range: '800 – 1,200', accent: '#f97316', bg: 'bg-orange-100/80', border: 'border-orange-200/50', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  { label: 'Oracle',     min: 1200, max: Infinity, icon: Sparkles,  range: '1,200+',      accent: '#00C2A8', bg: 'bg-teal-100/80',   border: 'border-teal-200/50',   badgeBg: 'bg-teal-100',   badgeText: 'text-teal-700' },
];

export function getBand(score: number) {
  return SCORE_BANDS.find(b => score >= b.min && score < b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function fmt(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  const { address, token } = usePresightApi();
  const { getLeaderboard } = useProfile(token || undefined);

  useEffect(() => {
    getLeaderboard.execute();
  }, []); // Fetch global leaderboard on mount

  const isLoading = getLeaderboard.loading;
  // data.entries comes from the backend payload format
  const globalData: LeaderboardEntry[] = (getLeaderboard.data as any)?.entries || [];

  // Identify the current user's entry (or build a default fallback if they aren't ranked)
  const meIndex = globalData.findIndex(e => e.address.toLowerCase() === address?.toLowerCase());
  const me = meIndex !== -1 ? globalData[meIndex] : {
    rank: globalData.length + 1,
    address: address || "0x0000000000000000000000000000000000000000",
    convictionScore: 0,
    winRate: 0,
    marketsPlayed: 0,
    wins: 0
  };

  const meBand = getBand(me.convictionScore);
  const rows = showAll ? globalData : globalData.slice(0, 5);

  return (
    <div className="font-sans min-h-screen py-10 space-y-10 bg-transparent">
      <div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ─── LEFT COLUMN (Main Content) ─────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            
            {/* Hero Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-3 pb-2 border-b border-black/[0.03]">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <span className="text-[10px] text-blue-500">●</span>
                Global Conviction Leaderboard
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-gray-900 uppercase">
                Rank by conviction,<br />not by luck.
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl pr-4 font-medium">
                Scores reset only on{' '}
                <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md font-mono text-gray-600">market:resolved</code>
                {' '}— a correct big bet beats a dozen small hedges.
              </p>
            </motion.div>

            {/* Leaderboard Table Container */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Top Predictors</h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                  {globalData.length} Ranked
                </span>
              </div>

              {/* Header row */}
              <div className="grid gap-2 px-4 py-3 mb-2 bg-gray-50 rounded-2xl border border-gray-100"
                style={{ gridTemplateColumns: '40px 44px 1fr 80px 80px 100px' }}>
                {['', '', 'PREDICTOR', 'WIN RATE', 'W / TOTAL', 'SCORE'].map((h, i) => (
                  <div key={i} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 3 ? 'text-center' : 'text-left'}`}>
                    {h}
                  </div>
                ))}
              </div>

              {isLoading && globalData.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aggregating protocol scores...</div>
                </div>
              ) : globalData.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Target className="w-12 h-12 text-gray-200 mb-4" />
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">No predictors ranked yet</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {rows.map((entry) => {
                    const band = getBand(entry.convictionScore);
                    const pct = Math.min((entry.convictionScore / 1600) * 100, 100);
                    const showMedal = entry.rank <= 3;
                    const medalColor = entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-orange-500';
                    const isCurrentUser = entry.address.toLowerCase() === address?.toLowerCase();

                    return (
                      <div
                        key={entry.rank}
                        className={`grid gap-2 items-center px-4 py-3 rounded-2xl transition-all duration-200 hover:bg-gray-50 border ${
                          isCurrentUser 
                            ? 'bg-blue-50/50 border-blue-100 relative overflow-hidden' 
                            : 'bg-white border-transparent hover:border-gray-100'
                        }`}
                        style={{ gridTemplateColumns: '40px 44px 1fr 80px 80px 100px' }}
                      >
                        {isCurrentUser && (
                          <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: band.accent }} />
                        )}

                        {/* Rank */}
                        <div className="text-center">
                          {showMedal && !isCurrentUser
                            ? <Award size={20} className={`mx-auto ${medalColor}`} />
                            : <span className={`text-xs font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-400'}`}>#{entry.rank}</span>
                          }
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${entry.address}`} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Name + bar */}
                        <div className="pl-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold font-mono ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                              {fmt(entry.address)}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold tracking-wider text-white bg-blue-500 rounded-lg px-2 py-0.5">YOU</span>
                            )}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-[200px]">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%`, background: band.accent }}
                            />
                          </div>
                        </div>

                        {/* Win rate */}
                        <div className="text-center">
                          <div className={`text-base font-bold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>{entry.winRate}%</div>
                        </div>

                        {/* W / Total */}
                        <div className="text-center">
                          <div className={`text-sm font-bold ${isCurrentUser ? 'text-blue-700/80' : 'text-gray-500'}`}>{entry.wins}/{entry.marketsPlayed || entry.totalCalls}</div>
                        </div>

                        {/* Score */}
                        <div className="text-right sm:text-center">
                          <div className={`text-lg font-bold tracking-tight ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                            {entry.convictionScore.toLocaleString()}
                          </div>
                          <span className={`inline-flex mt-1 items-center gap-1 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-lg border uppercase ${band.badgeBg} ${band.badgeText} ${band.border}`}>
                            <band.icon size={10} /> {band.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show more / less */}
              {globalData.length > 5 && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-6 py-3 text-xs font-bold text-gray-700 transition-colors duration-200 uppercase tracking-widest"
                  >
                    {showAll ? '↑ Collapse List' : `↓ Show All ${globalData.length} Predictors`}
                  </button>
                </div>
              )}
            </div>

            {/* How It's Calculated */}
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
              <button
                onClick={() => setFormulaOpen(!formulaOpen)}
                className="w-full flex items-center justify-between px-8 py-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-emerald-500">●</span>
                  <span className="text-sm font-bold text-gray-900 tracking-tight">How Conviction Score is calculated</span>
                </div>
                <div className={`text-gray-400 transform transition-transform duration-300 ${formulaOpen ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              <AnimatePresence>
                {formulaOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 space-y-6 border-t border-gray-100 pt-6">
                      {/* Formula block */}
                      <div className="rounded-2xl p-6 bg-gray-900 font-mono text-gray-300 shadow-inner">
                        <div className="text-[11px] text-emerald-400 font-bold mb-4 tracking-wider">// On every market:resolved event</div>
                        <div className="text-sm leading-8">
                          <span className="text-blue-400">stakeWeight</span>
                          <span className="text-gray-500"> = </span>
                          <span className="text-gray-100">userStake</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-gray-100">totalPool</span>
                          <span className="text-gray-500">  &nbsp;// 0 → 1</span>
                          <br />
                          <span className="text-blue-400">scoreDelta</span>
                          <span className="text-gray-500"> = </span>
                          <span className="text-yellow-400">isWinner</span>
                          <span className="text-gray-500"> ? </span>
                          <span className="text-gray-100">round(stakeWeight × 1000)</span>
                          <span className="text-gray-500"> : </span>
                          <span className="text-gray-100">0</span>
                        </div>
                      </div>
                      {/* Three pillars */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { icon: Dices, title: 'No Hedging', body: 'Splitting stakes gives near-zero weight. Correct hedges earn almost nothing.' },
                          { icon: Scale, title: 'Ratio Weighted', body: '1,000 in a 10k pool hits exactly like 10 in a 100 pool.' },
                          { icon: Target, title: 'Accuracy Crucial', body: 'Losses pay out 0 points. Blind spam hurts your relative ranking.' },
                        ].map((p, idx) => (
                          <div key={idx} className="rounded-2xl p-5 bg-gray-50 border border-gray-100">
                            <div className="mb-3 text-gray-700"><p.icon size={24} /></div>
                            <div className="text-sm font-bold text-gray-900 mb-2">{p.title}</div>
                            <div className="text-xs text-gray-500 leading-relaxed font-medium">{p.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ─── RIGHT COLUMN (Sticky Side Panel) ──────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-28 flex flex-col gap-6">
              
              {/* Your Standing Box */}
              <div className="rounded-[32px] p-8 relative overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(160deg, #0c1e3d 0%, #0a0a0a 55%, #1a1a2e 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${meBand.accent}, ${meBand.accent}88)` }} />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Global Standing</div>
                    <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                      RANK {meIndex !== -1 ? `#${me.rank}` : 'UNRANKED'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-inner overflow-hidden bg-white/5">
                      <img 
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${me.address}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white/90 font-mono tracking-tight">{fmt(me.address)}</div>
                      <div className="text-xs text-white/50 font-medium mt-1">Win Rate: <span className="text-white/80">{me.winRate}%</span></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-5xl font-black tracking-tight text-white leading-none mb-2">{me.convictionScore.toLocaleString()}</div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Conviction Score</div>
                      <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md" style={{ background: `${meBand.accent}33`, color: meBand.accent }}>
                        <meBand.icon size={14} /> {meBand.label}
                      </span>
                    </div>

                    <div className="bg-white/10 rounded-full h-2 overflow-hidden w-full">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ background: meBand.accent, width: `${Math.min((me.convictionScore / 1600) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-white/30 font-bold">
                      <span>0pts</span>
                      <span>Next Rank: 1,600pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Bands Guide */}
              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-3">
                <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase px-2 mb-4">Rank Bands</div>
                <div className="space-y-2">
                  {SCORE_BANDS.map(b => {
                    const isMe = me.convictionScore >= b.min && me.convictionScore < b.max;
                    return (
                      <div
                        key={b.label}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${b.bg} ${b.border}`}
                      >
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full ${b.badgeBg} ${b.badgeText}`}>
                          <b.icon size={16} />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-900">{b.label}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{b.range} pts</div>
                        </div>
                        {isMe && (
                          <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-lg border ${b.badgeBg} ${b.badgeText} ${b.border}`}>
                            YOU
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anti-Rewards Warning */}
              <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gray-200/80 flex items-center justify-center text-gray-700">
                    <Ban size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">What the score doesn&apos;t reward</h3>
                </div>
                <ul className="space-y-4 text-xs text-gray-500 font-medium pb-2">
                  <li className="flex gap-3"><Dices size={14} className="text-gray-400 mt-0.5" /> Random Hedging (Near zero delta)</li>
                  <li className="flex gap-3"><Coins size={14} className="text-gray-400 mt-0.5" /> Pure Volume (Relative stakes matter)</li>
                  <li className="flex gap-3"><ClipboardList size={14} className="text-gray-400 mt-0.5" /> Blind Participation (Zero payout on loss)</li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
